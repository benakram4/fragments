# tests/integration/delete-fragment-fail
DELETE http://localhost:8080/v1/fragments/123

[BasicAuth]
user1@email.com:password1

HTTP/1.1 404

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404
jsonpath "$.error.message" == "Fragment with id 123 not found"

