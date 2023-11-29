# tests/integration/lab-10-dynamodb
# POST a new JSON fragment to http://localhost:8080 as an authorized user
# 1.
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: application/json
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request goes in ```...``` when it's a string
{"service":"DynamoDB"}

# 2.
# Confirm that the server returns a 201
HTTP/1.1 201
Content-Type: application/json; charset=utf-8

# capture the Location header value and the fragment's id 
# in variables named fragment1_url and fragment1_id
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# 3.
# GET the fragment from the Location URL + info
GET {{fragment1_url}}/info
Content-Type: application/json; charset=utf-8
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json; charset=utf-8

# confirm metadata properties match what you expect.
[Asserts]
# The Content-Type header should be application/json
header "Content-Type" == "application/json; charset=utf-8"
# The Location header should look like what we expect (including the fragment id)
jsonpath "$.status" == "ok"
# Our fragment ids use UUIDs, see https://ihateregex.io/expr/uuid/
jsonpath "$.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
# Our ownerId hash is a hex encoded string
jsonpath "$.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
# You could also write a regex for this and use matches
jsonpath "$.created" isString
jsonpath "$.updated" isString
jsonpath "$.type" == "application/json"


#POST a second Markdown
# 4. 
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
`DynamoDB is **great**.`

# Confirm that the server returns a 201,
# 5.
HTTP/1.1 201
Content-Type: application/json; charset=utf-8

# capture the Location header value and the second id in variables named 
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

# GET the fragment info 
# 6.
GET {{fragment2_url}}/info
Content-Type: application/json; charset=utf-8
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json; charset=utf-8

# confirm metadata properties match what you expect.
[Asserts]
# The Content-Type header should be application/json
header "Content-Type" == "application/json; charset=utf-8"
# The Location header should look like what we expect (including the fragment id)
jsonpath "$.status" == "ok"
# Our fragment ids use UUIDs, see https://ihateregex.io/expr/uuid/
jsonpath "$.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
# Our ownerId hash is a hex encoded string
jsonpath "$.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
# You could also write a regex for this and use matches
jsonpath "$.created" isString
jsonpath "$.updated" isString
jsonpath "$.type" == "text/markdown"

# GET all of the fragments for the same authorized 
# user without expanding them
# 7.
GET http://localhost:8080/v1/fragments
Content-Type: application/json; charset=utf-8
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json; charset=utf-8

# confirm that the list of fragments includes 
# the two id values you captured above
[Asserts]
jsonpath "$.fragments" includes "{{fragment1_id}}"
jsonpath "$.fragments" includes "{{fragment2_id}}"

# DELETE the first fragment you created above
# 8.
DELETE {{fragment1_url}}
Content-Type: application/json; charset=utf-8
[BasicAuth]
user1@email.com:password1

# Confirm that the server returns a 200
# 9.
HTTP/1.1 200
Content-Type: application/json; charset=utf-8

# Try to GET the first fragment again
# 10.
GET {{fragment1_url}}/info
Content-Type: application/json; charset=utf-8
[BasicAuth]
user1@email.com:password1

# Confirm that the server returns a 404
# 11.
HTTP/1.1 404
Content-Type: application/json; charset=utf-8

# GET all of the fragments for the same authorized user
# 12.
GET http://localhost:8080/v1/fragments
Content-Type: application/json; charset=utf-8
[BasicAuth]
user1@email.com:password1

# confirm that the first id is NOT included but that the second id is 
HTTP/1.1 200
Content-Type: application/json; charset=utf-8

[Asserts]
jsonpath "$.fragments" not includes "{{fragment1_id}}"
jsonpath "$.fragments" includes "{{fragment2_id}}"