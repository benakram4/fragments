# tests/integration/post-fragments-unauthenticated
POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8

`This is a test fragment.`

HTTP/1.1 401
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.message" == "Unauthorized"
jsonpath "$.error.code" == 401
