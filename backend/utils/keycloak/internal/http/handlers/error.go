package handlers

type ErrorBody struct {
	ErrorCode        string      `json:"error_code"`
	ErrorDescription string      `json:"error_description"`
	ErrorSource      string      `json:"error_source"`
	ErrorStack       interface{} `json:"error_stack"`
}

func Err(code, desc, src string, stack any) ErrorBody {
	return ErrorBody{ErrorCode: code, ErrorDescription: desc, ErrorSource: src, ErrorStack: stack}
}