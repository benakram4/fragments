# tests/integration/post-fragments-charset
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: text/plain; charset=utf-8
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
`This is a text fragment!`

# 1. We expect to get back an HTTP 201
HTTP/1.1 201
# We have various assertions about the response that we want to check
[Asserts]
# The Location header should look like what we expect (including the fragment id)
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"

[Captures]
url: header "Location"

# 2. We expect type to be text/plain
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

# 3. We expect the body to be the same as what we sent
# and the "Content-Type" to be text/plain ; charset=utf-8"
[Asserts]
body == "This is a text fragment!"
header "Content-Type" startsWith "text/plain"


