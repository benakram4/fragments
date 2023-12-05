# test/integration/put-fragment-no-id
# 1. PUT to a non existent fragment id
PUT http://localhost:8080/v1/fragments/123
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{"name":"ben"}

# 3. We expect to get back an HTTP 404
HTTP/1.1 404

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404