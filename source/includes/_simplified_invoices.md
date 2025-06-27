#<a name="simplified-invoices-section"></a> Simplified Invoices

Endpoints to manage simplified invoices.

NOTE: These replace part of the deprecated [Tickets endopoints](#tickets-section) endpoints. Check [their documentation](#tickets-section) to understand why.

## Attributes

Attr. name |  Constraints
---------- |  -----------
kind | REQUIRED <br> Accepted values: `income` or `expenses`
number | For income simplified invoices we recommend leave it blank, and Quipu will assign it (and they also need to be unique within a fiscal year).
issue_date | REQUIRED <br> Format: `YYYY-mm-dd`
paid_at  | Format: `YYYY-mm-dd`
payment_method | Accepted valued: `cash`, `bank_transfer`, `bank_card`, `direct_debit`, `paypal`, `check`, `factoring`
payment_status | READ ONLY
total_amount   | READ ONLY
total_amount | READ ONLY
total_amount_without_taxes | READ ONLY
vat_amount | READ ONLY
stage | READ ONLY, for income simplified invoices only<br>Possible values: `draft` or `final`, depending on `paid_at` and `due_dates` values.
issuing_name | REQUIRED for expense simplified invoices.<br>READ ONLY for income simplified invoices. *
issuing_tax_id | READ ONLY, *
issuing_address | READ ONLY, *
issuing_phone | READ ONLY, *
issuing_town | READ ONLY, *
issuing_zip_code | READ ONLY, *
issuing_country_code | READ ONLY, *
recipient_name | REQUIRED for income simplified invoices.<br>READ ONLY for expense simplified invoices. *
recipient_tax_id | READ ONLY, *
recipient_address | READ ONLY, *
recipient_phone | READ ONLY, *
recipient_town | READ ONLY, *
recipient_zip_code | READ ONLY, *
recipient_country_code | READ ONLY, *
tags | Format: a list of strings separated by comma
notes | Format: a string
download_pdf_url | Url to download the pdf document for the simplified invoice. Present only in income simplified invoices. Needs the same authorization header.
download_pdf_url | Url to download the pdf document for the invoice. Present only in income simplified invoices. Needs the same authorization header.

\* These fields will be populated and updated each time an invoice is saved from the information of the Quipu account owner and the contact associatied with the book entry.

## Relationships

Relationship name |  Constraints
----------------- |  -----------
accounting_category |
accounting_subcategory |
numeration | Applicable only to simplified invoices with `kind = income`
analytic_categories | Can not be a root analytic category
items | Can be sideloaded in GET requests. <br> Must be included in the payload in POST/PATCH/PUT requests
amended_simplified_innvoice | The simplified invoice amended by the current one.
amending_simplified_invoices | Simplified invoice that amends the current one (Read Only)

## Listing simplified invoices

> Example request

```shell
curl "https://getquipu.com/simplified_invoices" \
  -H "Authorization: Bearer be32259bd1d0f4d3d02bcc0771b1b507e2b666ba9e9ba3d7c5639e853f722eb4" \
  -H "Accept: application/vnd.quipu.v1+json"
```

> Example response

```shell
{
  "data": [{
    "id": "2988939",
    "type": "simplified_invoices",
    "attributes": {
      "kind": "income",
      "number": "t16-53",
      "issue_date": "2016-02-29",
      "paid_at": "2016-03-02",
      "payment_method": "cash",
      "payment_status": "paid",
      "total_amount": "5.40",
      "total_amount_without_taxes": "4.46",
      "vat_amount": "0.94",
      "issuing_name": "QuipuApp S.L.",
      "issuing_tax_id": "43467890F",
      "issuing_address": "C/ Viladomat 39",
      "issuing_phone": "123456789",
      "issuing_town": "San Cucufate",
      "issuing_zip_code": "09876",
      "issuing_country_code": "es",
      "recipient_name": "Manolo",
      "recipient_tax_id": "",
      "recipient_address": "",
      "recipient_phone": "",
      "recipient_town": "",
      "recipient_zip_code": "",
      "recipient_country_code": "",
      "tags": ""
    },
    "relationships": {
      "accounting_category": {
        "data": {
          "type": "accounting_categories",
          "id": "133"
        }
      },
      "accounting_subcategory": {
        "data": null
      },
      "numeration": {
        "data": {
          "type": "numbering_series",
          "id": "6332"
        }
      },
      "analytic_categories": {
        "data":[]
      },
      "items": {
        "data": [{
          "type": "book_entry_items",
          "id": "3399147"
        }]
      }
    }
  }, {
    "id": "2937714",
    "type": "simplified_invoices",
    "attributes": {
      "kind": "income",
      "number": "t16-53",
      "issue_date": "2016-01-31",
      "paid_at": "2016-02-03",
      "payment_method": "cash",
      "payment_status": "paid",
      "total_amount": "5.40",
      "total_amount_without_taxes": "4.46",
      "vat_amount": "0.94",
      "issuing_name": "QuipuApp S.L.",
      "issuing_tax_id": "43467890F",
      "issuing_address": "C/ Viladomat 39",
      "issuing_phone": "123456789",
      "issuing_town": "San Cucufate",
      "issuing_zip_code": "09876",
      "issuing_country_code": "es",
      "recipient_name": "Manolo",
      "recipient_tax_id": "",
      "recipient_address": "",
      "recipient_phone": "",
      "recipient_town": "",
      "recipient_zip_code": "",
      "recipient_country_code": "",
      "tags": ""
    },
    "relationships": {
      "accounting_category": {
        "data": {
          "type": "accounting_categories",
          "id": "133"
        }
      },
      "accounting_subcategory": {
        "data": null
      },
      "numeration": {
        "data": {
          "type": "numbering_series",
          "id": "6326"
        }
      },
      "analytic_categories": {
        "data": []
      },
      "items": {
        "data": [{
          "type": "book_entry_items",
          "id": "3319559"
        }]
      }
    }
  }, {

  ...

  },
  "meta": {
    pagination_info: {
      "total_pages": 2
      "current_page": 1
      "total_results": 23
    }
  }
}
```

`GET /simplfied_invoices`

### Available filters

See [Invoices, simplified invoices and paysheets => Available filters](#book-entries-available-filters)

### Sorting

See [Invoices, simplified invoices and paysheets => Sorting](#book-entries-sorting)

### Side loading items

If you want to retrieve the complete information about the items associated with the simplified invoices, you can pass `?include=items` in the url

Example:

`GET /simplified invoices?include=items`

## Getting a simplified invoice

> Example request

```shell
curl "https://getquipu.com/simplified_invoices/2989809" \
  -H "Authorization: Bearer be32259bd1d0f4d3d02bcc0771b1b507e2b666ba9e9ba3d7c5639e853f722eb4" \
  -H "Accept: application/vnd.quipu.v1+json"
```

> Example response

```shell
{
  "data": {
    "id": "2989809",
    "type": "simplified_invoices",
    "attributes": {
      "kind": "income",
      "number": "t16-53",
      "issue_date": "2016-02-29",
      "paid_at": "2016-03-02",
      "payment_method": "cash",
      "payment_status": "paid",
      "total_amount": "5.40",
      "total_amount_without_taxes": "4.46",
      "vat_amount": "0.94",
      "issuing_name": "QuipuApp S.L.",
      "issuing_tax_id": "43467890F",
      "issuing_address": "C/ Viladomat 39",
      "issuing_phone": "123456789",
      "issuing_town": "San Cucufate",
      "issuing_zip_code": "09876",
      "issuing_country_code": "es",
      "recipient_name": "Manolo",
      "recipient_tax_id": "",
      "recipient_address": "",
      "recipient_phone": "",
      "recipient_town": "",
      "recipient_zip_code": "",
      "recipient_country_code": "",
      "tags": ""
    },
    "relationships": {
      "accounting_category": {
        "data": {
          "type": "accounting_categories",
          "id": "133"
        }
      },
      "accounting_subcategory": {
        "data": null
      },
      "numeration": {
        "data": {
          "type": "numbering_series",
          "id": "6332"
        }
      },
      "analytic_categories": {
        "data":[]
      },
      "items": {
        "data": [{
          "type": "book_entry_items",
          "id": "3399147"
        }]
      }
    }
  }
}
```

`GET /simplified_invoices/:simplified_invoice_id` |
`GET /simplified_invoices/:simplified_invoice_id?include=items`

## Creating a simplified invoice

> Example request

```shell
curl "https://getquipu.com/simplified_invoices" \
  -H "Authorization: Bearer be32259bd1d0f4d3d02bcc0771b1b507e2b666ba9e9ba3d7c5639e853f722eb4" \
  -H "Accept: application/vnd.quipu.v1+json" \
  -H "Content-Type: application/vnd.quipu.v1+json" \
  -d '{
        "data": {
          "type": "simplified_invoices",
          "attributes": {
            "kind": "income",
            "number": null,
            "recipient_name": "unknown",
            "issue_date": "2016-03-08",
            "paid_at": "2016-03-08",
            "payment_method": "cash",
            "tags": "songo, timba"
          },
          "relationships": {
            "accounting_category": {
              "data": {
                "id": 123,
                "type": "accounting_categories"
              }
            },

            ...

            "items": {
              "data": [{
                "type": "book_entry_items",
                "attributes": {
                  "concept": "Tornillos",
                  "unitary_amount": "0.50",
                  "quantity": 30,
                  "vat_percent": 21
                },
                "relationships": {
                  "accounting_category": {
                    "data": {
                      "type": "accounting_categories",
                      "id": "133"
                    }
                  },
                  "accounting_subcategory": {
                    "data": {
                      "type": "accounting_subcategories",
                      "id": "1234"
                    }
                  },
                }
              }, {
                "type": "book_entry_items",
                "attributes": {
                  "concept": "Tuercas",
                  "unitary_amount": "0.35",
                  "quantity": 30,
                  "vat_percent": 21
                }
              }]
            }
          }
        }
      }'
```

`POST /simplified_invoices`

## Updating a simplified invoice

> Example request


```shell
# This request will update the attributes of the item with id 23424141,
# create a new item with concept "Tuercas",
# and destroy other items associated to the simplified invoice if any.

curl "https://getquipu.com/simplified_invoices/2682381" \
  -X PATCH \
  -H "Authorization: Bearer 818abe1ea4a1813999a47105892d50f3781320c588fb8cd2927885963e621228" \
  -H "Accept: application/vnd.quipu.v1+json" \
  -H "Content-Type: application/vnd.quipu.v1+json" \
  -d '{
        "data": {
          "type": "invoices",
          "id": 2682381,
          "attributes": {
            "paid_at": "21-2-2016"
          },
          "relationships": {
            "items": {
              "data": [{
                "id": 23424141,
                "type": "book_entry_items",
                "attributes": {
                  "concept": "Tornillos",
                  "unitary_amount": "0.50",
                  "quantity": 30,
                  "vat_percent": 21
                },
                "relationships": {
                  "accounting_category": {
                    "data": {
                      "type": "accounting_categories",
                      "id": "133"
                    }
                  },
                  "accounting_subcategory": {
                    "data": {
                      "type": "accounting_subcategories",
                      "id": "1234"
                    }
                  },
                }
              }, {
                "type": "book_entry_items",
                "attributes": {
                  "concept": "Tuercas",
                  "unitary_amount": "0.35",
                  "quantity": 30,
                  "vat_percent": 21
                }
              }]
            }
          }
        }
      }'
```

`(PUT|PATCH) /simplified_invoices/:simplified_invoice_id`

## Deleting a simplified invoice

> Example request

```shell
curl "https://getquipu.com/simplified_invoices/2988939" \
  -X DELETE
  -H "Authorization: Bearer be32259bd1d0f4d3d02bcc0771b1b507e2b666ba9e9ba3d7c5639e853f722eb4" \
  -H "Accept: application/vnd.quipu.v1+json"
```

`DELETE /simplified_invoices/:simplified_invoice_id`

## Refunds and amending simplified invoices

A simplified invoice can be totally or partially amended. The minimal amount of data needed to create an amending simplified invoice is the relationship `amended_simplified_invoice`. With this data a complete refund of the original simplified invoice will be created.

You can also partially amend a simplified invoice setting the items of the amending simplified invoice manually.

> Example request for a complete refund

```shell
curl "https://getquipu.com/simplified_invoices" \
  -H "Authorization: Bearer be32259bd1d0f4d3d02bcc0771b1b507e2b666ba9e9ba3d7c5639e853f722eb4" \
  -H "Accept: application/vnd.quipu.v1+json" \
  -H "Content-Type: application/vnd.quipu.v1+json" \
  -d '{
        "data": {
          "type": "simplified_invoices",
          "relationships": {
            "amended_simplified_invoice": {
              "data": {
                "id": 879495,
                "type": "simplified_invoices"
              }
            }
          }
        }
      }'
```

> Example of a partial refund

```shell
curl "https://getquipu.com/simplified_invoices" \
  -H "Authorization: Bearer be32259bd1d0f4d3d02bcc0771b1b507e2b666ba9e9ba3d7c5639e853f722eb4" \
  -H "Accept: application/vnd.quipu.v1+json" \
  -H "Content-Type: application/vnd.quipu.v1+json" \
  -d '{
        "data": {
          "type": "simplified_invoices",
          "relationships": {
            "amended_simplified_invoice": {
              "data": {
                "id": 879495,
                "type": "simplified_invoices"
              }
            },
            "items": {
              "data": [{
                "type": "book_entry_items",
                "attributes": {
                  "concept": "Partial refund for service delay",
                  "quantity": 1,
                  "unitary_amount": "-5.00",
                  "vat_percent": 21
                }
              }]
            }
          }
        }
      }'
```
