# tests/integration/delete-fragment

# 1. Create a fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`This is a fragment to be deleted!`

HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"

# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"


# 2. Get the fragment
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
body == "This is a fragment to be deleted!"

# 3. Delete the fragment
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"

