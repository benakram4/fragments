# test/integration/put-fragment-diff-type
# 1. POST a fragment with text/plain type
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`text fragment`

# 1. We expect to get back an HTTP 201
HTTP/1.1 201

[Asserts]
# expect an ok response from the server
jsonpath "$.status" == "ok"
# expect the fragment to to have a text/plain type
jsonpath "$.fragment.type" == "text/plain"

# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

# 2. PUT the fragment with a different type
PUT {{url}}
# We're sending a JSON fragment to fail the type check
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
# Body of the request goes in ```...``` when it's a string
{"name":"ben"}

# 3. We expect to get back an HTTP 400
HTTP/1.1 400

[Asserts]
header "Content-Type" == "application/json; charset=utf-8"
# expect an error response from the server
jsonpath "$.status" == "error"
# expect the fragment to to have a text/plain type
jsonpath "$.error.message" == "Error in PUT, types do not match"
header "Content-Type" not contains "text/plain"


