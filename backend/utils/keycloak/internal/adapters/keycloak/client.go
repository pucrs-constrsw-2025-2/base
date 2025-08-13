package keycloak

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

type Options struct {
	BaseURL       string
	Realm         string
	ClientID      string
	ClientSecret  string
	HTTPTimeoutMs int
}

type Client struct {
	opt Options
	hc  *http.Client
}

func NewClient(opt Options) *Client {
	to := time.Duration(opt.HTTPTimeoutMs) * time.Millisecond
	if to == 0 {
		to = 15 * time.Second
	}
	return &Client{opt: opt, hc: &http.Client{Timeout: to}}
}

func (c *Client) tokenEndpoint() string {
	return fmt.Sprintf("%s/realms/%s/protocol/openid-connect/token", c.opt.BaseURL, c.opt.Realm)
}

func (c *Client) adminUsersBase() string {
	return fmt.Sprintf("%s/admin/realms/%s/users", c.opt.BaseURL, c.opt.Realm)
}

func (c *Client) adminRolesBase() string {
	return fmt.Sprintf("%s/admin/realms/%s/roles", c.opt.BaseURL, c.opt.Realm)
}

// --- Auth ---

type tokenResp struct {
	TokenType        string `json:"token_type"`
	AccessToken      string `json:"access_token"`
	ExpiresIn        int    `json:"expires_in"`
	RefreshToken     string `json:"refresh_token"`
	RefreshExpiresIn int    `json:"refresh_expires_in"`
}

func (c *Client) PasswordLogin(ctx context.Context, username, password string) (tokenResp, error) {
	form := url.Values{}
	form.Set("client_id", c.opt.ClientID)
	form.Set("client_secret", c.opt.ClientSecret)
	form.Set("grant_type", "password")
	form.Set("username", username)
	form.Set("password", password)

	req, _ := http.NewRequestWithContext(ctx, http.MethodPost, c.tokenEndpoint(), bytes.NewBufferString(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	res, err := c.hc.Do(req)
	if err != nil {
		return tokenResp{}, err
	}
	defer res.Body.Close()
	if res.StatusCode >= 400 {
		b, _ := io.ReadAll(res.Body)
		return tokenResp{}, fmt.Errorf("keycloak token error: %d %s", res.StatusCode, string(b))
	}
	var tr tokenResp
	if err := json.NewDecoder(res.Body).Decode(&tr); err != nil {
		return tokenResp{}, err
	}
	return tr, nil
}

// --- Users ---

type kcUser struct {
	ID        string `json:"id,omitempty"`
	Username  string `json:"username"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Enabled   bool   `json:"enabled"`
	Email     string `json:"email,omitempty"`
}

type cred struct {
	Type      string `json:"type"`
	Value     string `json:"value"`
	Temporary bool   `json:"temporary"`
}

func bearerHeader(b string) string { return "Bearer " + b }

func (c *Client) CreateUser(ctx context.Context, bearer string, u kcUser, plainPassword string) (string, error) {
	body, _ := json.Marshal(u)
	req, _ := http.NewRequestWithContext(ctx, http.MethodPost, c.adminUsersBase(), bytes.NewReader(body))
	req.Header.Set("Authorization", bearerHeader(bearer))
	req.Header.Set("Content-Type", "application/json")

	res, err := c.hc.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()
	if res.StatusCode == http.StatusConflict {
		return "", errors.New("409: username already exists")
	}
	if res.StatusCode >= 400 {
		b, _ := io.ReadAll(res.Body)
		return "", fmt.Errorf("keycloak create user error: %d %s", res.StatusCode, string(b))
	}
	loc := res.Header.Get("Location")
	if loc == "" {
		return "", errors.New("missing Location header from Keycloak")
	}
	// /admin/realms/{realm}/users/{id}
	var id string
	if _, err := fmt.Sscanf(loc, c.adminUsersBase()+"/%s", &id); err == nil {
		// strip possible suffixes
		if i := len(id); i > 36 {
			id = id[:36]
		}
	}
	// set initial password
	pwdURL := fmt.Sprintf("%s/%s/reset-password", c.adminUsersBase(), id)
	pwdbody, _ := json.Marshal(cred{Type: "password", Value: plainPassword, Temporary: false})
	reqPwd, _ := http.NewRequestWithContext(ctx, http.MethodPut, pwdURL, bytes.NewReader(pwdbody))
	reqPwd.Header.Set("Authorization", bearerHeader(bearer))
	reqPwd.Header.Set("Content-Type", "application/json")
	resPwd, err := c.hc.Do(reqPwd)
	if err != nil {
		return "", err
	}
	defer resPwd.Body.Close()
	if resPwd.StatusCode >= 400 {
		return "", fmt.Errorf("set password failed: %d", resPwd.StatusCode)
	}
	return id, nil
}

func (c *Client) GetUsers(ctx context.Context, bearer string, enabled *bool) ([]kcUser, error) {
	endpoint := c.adminUsersBase()
	if enabled != nil {
		endpoint = fmt.Sprintf("%s?enabled=%t", endpoint, *enabled)
	}
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	req.Header.Set("Authorization", bearerHeader(bearer))
	res, err := c.hc.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.StatusCode >= 400 {
		b, _ := io.ReadAll(res.Body)
		return nil, fmt.Errorf("keycloak list users error: %d %s", res.StatusCode, string(b))
	}
	var out []kcUser
	if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
		return nil, err
	}
	return out, nil
}

func (c *Client) GetUserByID(ctx context.Context, bearer, id string) (kcUser, error) {
	endpoint := fmt.Sprintf("%s/%s", c.adminUsersBase(), id)
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	req.Header.Set("Authorization", bearerHeader(bearer))
	res, err := c.hc.Do(req)
	if err != nil {
		return kcUser{}, err
	}
	defer res.Body.Close()
	if res.StatusCode == 404 {
		return kcUser{}, fmt.Errorf("404: not found")
	}
	if res.StatusCode >= 400 {
		b, _ := io.ReadAll(res.Body)
		return kcUser{}, fmt.Errorf("keycloak get user error: %d %s", res.StatusCode, string(b))
	}
	var u kcUser
	if err := json.NewDecoder(res.Body).Decode(&u); err != nil {
		return kcUser{}, err
	}
	return u, nil
}

func (c *Client) UpdateUser(ctx context.Context, bearer, id string, u kcUser) error {
	endpoint := fmt.Sprintf("%s/%s", c.adminUsersBase(), id)
	body, _ := json.Marshal(u)
	req, _ := http.NewRequestWithContext(ctx, http.MethodPut, endpoint, bytes.NewReader(body))
	req.Header.Set("Authorization", bearerHeader(bearer))
	req.Header.Set("Content-Type", "application/json")
	res, err := c.hc.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode == 404 {
		return fmt.Errorf("404: not found")
	}
	if res.StatusCode >= 400 {
		b, _ := io.ReadAll(res.Body)
		return fmt.Errorf("keycloak update user error: %d %s", res.StatusCode, string(b))
	}
	return nil
}

func (c *Client) UpdatePassword(ctx context.Context, bearer, id, pwd string) error {
	endpoint := fmt.Sprintf("%s/%s/reset-password", c.adminUsersBase(), id)
	body, _ := json.Marshal(cred{Type: "password", Value: pwd, Temporary: false})
	req, _ := http.NewRequestWithContext(ctx, http.MethodPut, endpoint, bytes.NewReader(body))
	req.Header.Set("Authorization", bearerHeader(bearer))
	req.Header.Set("Content-Type", "application/json")
	res, err := c.hc.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode == 404 {
		return fmt.Errorf("404: not found")
	}
	if res.StatusCode >= 400 {
		b, _ := io.ReadAll(res.Body)
		return fmt.Errorf("keycloak update password error: %d %s", res.StatusCode, string(b))
	}
	return nil
}

func (c *Client) DisableUser(ctx context.Context, bearer, id string) error {
	// Em Keycloak, "exclusão lógica" pode ser modelada como update enabled=false
	return c.UpdateUser(ctx, bearer, id, kcUser{Enabled: false})
}

// --- Roles ---

type kcRole struct {
	ID          string `json:"id,omitempty"`
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	Composite   bool   `json:"composite"`
}

func (c *Client) GetRoles(ctx context.Context, bearer string) ([]kcRole, error) {
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, c.adminRolesBase(), nil)
	req.Header.Set("Authorization", bearerHeader(bearer))
	res, err := c.hc.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.StatusCode >= 400 {
		b, _ := io.ReadAll(res.Body)
		return nil, fmt.Errorf("keycloak list roles error: %d %s", res.StatusCode, string(b))
	}
	var out []kcRole
	if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
		return nil, err
	}
	return out, nil
}

func (c *Client) GetRoleByName(ctx context.Context, bearer, name string) (kcRole, error) {
	endpoint := fmt.Sprintf("%s/%s", c.adminRolesBase(), name)
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	req.Header.Set("Authorization", bearerHeader(bearer))
	res, err := c.hc.Do(req)
	if err != nil {
		return kcRole{}, err
	}
	defer res.Body.Close()
	if res.StatusCode == 404 {
		return kcRole{}, fmt.Errorf("404: not found")
	}
	if res.StatusCode >= 400 {
		b, _ := io.ReadAll(res.Body)
		return kcRole{}, fmt.Errorf("keycloak get role error: %d %s", res.StatusCode, string(b))
	}
	var role kcRole
	if err := json.NewDecoder(res.Body).Decode(&role); err != nil {
		return kcRole{}, err
	}
	return role, nil
}

func (c *Client) CreateRole(ctx context.Context, bearer string, role kcRole) error {
	body, _ := json.Marshal(role)
	req, _ := http.NewRequestWithContext(ctx, http.MethodPost, c.adminRolesBase(), bytes.NewReader(body))
	req.Header.Set("Authorization", bearerHeader(bearer))
	req.Header.Set("Content-Type", "application/json")
	res, err := c.hc.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode == http.StatusConflict {
		return errors.New("409: role already exists")
	}
	if res.StatusCode >= 400 {
		b, _ := io.ReadAll(res.Body)
		return fmt.Errorf("keycloak create role error: %d %s", res.StatusCode, string(b))
	}
	return nil
}

func (c *Client) UpdateRole(ctx context.Context, bearer, name string, role kcRole) error {
	endpoint := fmt.Sprintf("%s/%s", c.adminRolesBase(), name)
	body, _ := json.Marshal(role)
	req, _ := http.NewRequestWithContext(ctx, http.MethodPut, endpoint, bytes.NewReader(body))
	req.Header.Set("Authorization", bearerHeader(bearer))
	req.Header.Set("Content-Type", "application/json")
	res, err := c.hc.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode == 404 {
		return fmt.Errorf("404: not found")
	}
	if res.StatusCode >= 400 {
		b, _ := io.ReadAll(res.Body)
		return fmt.Errorf("keycloak update role error: %d %s", res.StatusCode, string(b))
	}
	return nil
}

func (c *Client) DeleteRole(ctx context.Context, bearer, name string) error {
	endpoint := fmt.Sprintf("%s/%s", c.adminRolesBase(), name)
	req, _ := http.NewRequestWithContext(ctx, http.MethodDelete, endpoint, nil)
	req.Header.Set("Authorization", bearerHeader(bearer))
	res, err := c.hc.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode == 404 {
		return fmt.Errorf("404: not found")
	}
	if res.StatusCode >= 400 {
		b, _ := io.ReadAll(res.Body)
		return fmt.Errorf("keycloak delete role error: %d %s", res.StatusCode, string(b))
	}
	return nil
}

func (c *Client) AssignRoleToUser(ctx context.Context, bearer, userID, roleName string) error {
	// Primeiro, buscar o role para obter seu ID
	role, err := c.GetRoleByName(ctx, bearer, roleName)
	if err != nil {
		return err
	}

	endpoint := fmt.Sprintf("%s/%s/role-mappings/realm", c.adminUsersBase(), userID)
	roles := []kcRole{role}
	body, _ := json.Marshal(roles)
	req, _ := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	req.Header.Set("Authorization", bearerHeader(bearer))
	req.Header.Set("Content-Type", "application/json")
	res, err := c.hc.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode == 404 {
		return fmt.Errorf("404: not found")
	}
	if res.StatusCode >= 400 {
		b, _ := io.ReadAll(res.Body)
		return fmt.Errorf("keycloak assign role error: %d %s", res.StatusCode, string(b))
	}
	return nil
}

func (c *Client) RemoveRoleFromUser(ctx context.Context, bearer, userID, roleName string) error {
	// Primeiro, buscar o role para obter seu ID
	role, err := c.GetRoleByName(ctx, bearer, roleName)
	if err != nil {
		return err
	}

	endpoint := fmt.Sprintf("%s/%s/role-mappings/realm", c.adminUsersBase(), userID)
	roles := []kcRole{role}
	body, _ := json.Marshal(roles)
	req, _ := http.NewRequestWithContext(ctx, http.MethodDelete, endpoint, bytes.NewReader(body))
	req.Header.Set("Authorization", bearerHeader(bearer))
	req.Header.Set("Content-Type", "application/json")
	res, err := c.hc.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode == 404 {
		return fmt.Errorf("404: not found")
	}
	if res.StatusCode >= 400 {
		b, _ := io.ReadAll(res.Body)
		return fmt.Errorf("keycloak remove role error: %d %s", res.StatusCode, string(b))
	}
	return nil
}

func (c *Client) GetUserRoles(ctx context.Context, bearer, userID string) ([]kcRole, error) {
	endpoint := fmt.Sprintf("%s/%s/role-mappings/realm", c.adminUsersBase(), userID)
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	req.Header.Set("Authorization", bearerHeader(bearer))
	res, err := c.hc.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.StatusCode == 404 {
		return nil, fmt.Errorf("404: not found")
	}
	if res.StatusCode >= 400 {
		b, _ := io.ReadAll(res.Body)
		return nil, fmt.Errorf("keycloak get user roles error: %d %s", res.StatusCode, string(b))
	}
	var roles []kcRole
	if err := json.NewDecoder(res.Body).Decode(&roles); err != nil {
		return nil, err
	}
	return roles, nil
}
