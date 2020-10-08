# Login an user
Use login credentials to login an user and receive an auth token.

**URL**:
`POST` `/login`

**Content-Type**:
`application/json`

**Request body**:

| Parameter | Required | Type |
|:----------|:---------|:-----|
| `username` | `true` | `string` |
| `password` | `true` | `string` |

## Responses

**Code**:
`200 OK`

**Content example**:
```json
{
  "success": true,
  "message": "Authentication successful",
  "token": "access token"
}
```

---

**Code**:
`403 Forbidden`

**Content example**:
```json
{
  "success": false,
  "message": "Authentication failed"
}
```
