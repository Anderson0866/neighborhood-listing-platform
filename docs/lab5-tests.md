\# Lab 5 access tests



These checks ran against the development Supabase project. Row counts below

were recorded before the new seed listing was added; later counts may differ.



| Test | Expected | Observed |

| --- | --- | --- |

| Signed-out visitor reads properties | Approved listings only | 1 of 3 visible |

| Signed-out visitor updates a property | Denied | Error 42501: permission denied |

| Owner reads properties | Approved and own unapproved listings | 1 approved, 1 unapproved |

| Different signed-in identity reads properties | No unapproved listings | 1 approved, 0 unapproved |

| Server role reads properties | All listings | 3 of 3 visible after grant migration |

| Owner updates own unapproved listing | Allowed | 1 row matched; transaction rolled back |

| Different identity updates unapproved listing | Denied | 0 rows matched; transaction rolled back |

| Unsigned POST /api/listings | Denied | HTTP 401 |

| Unsigned PATCH /api/listings | Denied | HTTP 401 |



The SQL write tests used `price = price` inside transactions that ended

with `rollback`, so they did not change stored listing values.

### Owner listing creation

- Signed-in property owner inserted a draft listing: 1 row returned. The test transaction was rolled back, so the listing was not saved.
- Signed-in property owner tried to insert an approved listing: blocked with `ERROR 42501: new row violates row-level security policy for table "properties"`. No listing was added.


### Signed-in API tests

- POST `/api/listings` with a signed-in property owner created a listing with `draft` status.
- PATCH `/api/listings` changed that owner's draft price from 450000 to 455000. A database query confirmed the new price.
- PATCH `/api/listings` against an approved listing returned HTTP 404. A database query confirmed that its price remained 500000.
