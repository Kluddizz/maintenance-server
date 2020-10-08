# Get all customers
Allows to fetch all customers of the system.

**URL**:
`GET` `/customer`

## Responses

**Code**:
`200 OK`

**Content example**:
```json
{
  "success": true,
  "message": "Fetched customers",
  "customers": []
}
```

---

**Code**:
`403 Forbidden`

**Content example**:
```json
{
  "success": false,
  "message": "Unauthorized"
}
```
