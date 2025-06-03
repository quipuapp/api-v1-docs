#<a name="additional-income-section"></a> Additional Income

Endpoints to manage Additional Income documents (income not tied to your main activity).

NOTE: These replace part of the deprecated [Tickets endpoints](#tickets-section) endpoints. Check [their documentation](#tickets-section) to understand why.

## Attributes

Attr. name |  Constraints
---------- |  -----------
number | We recommend leave it blank, and Quipu will assign it.<br>Must be unique within a fiscal year.
issue_date | REQUIRED <br> Format: `YYYY-mm-dd`
paid_at  | Format: `YYYY-mm-dd`
payment_method | Accepted valued: `cash`, `bank_transfer`, `bank_card`, `direct_debit`, `paypal`, `check`, `factoring`
payment_status | READ ONLY
total_amount   | READ ONLY
total_amount | READ ONLY
total_amount_without_taxes | READ ONLY
vat_amount | READ ONLY
recipient_name | REQUIRED
recipient_tax_id | READ ONLY, *
recipient_address | READ ONLY, *
recipient_phone | READ ONLY, *
recipient_town | READ ONLY, *
recipient_zip_code | READ ONLY, *
recipient_country_code | READ ONLY, *
tags | Format: a list of strings separated by comma
notes | Format: a string
download_pdf_url | Url to download the pdf document version. Needs the same authorization header.

\* These fields will be populated and updated each time an invoice is saved from the information of the Quipu account owner and the contact associatied with the book entry.

## Relationships

Relationship name |  Constraints
----------------- |  -----------
accounting_category |
accounting_subcategory |
numeration |
analytic_categories | Can not be a root analytic category
items | Can be sideloaded in GET requests. <br> Must be included in the payload in POST/PATCH/PUT requests

## Listing additional income

> Example request

```shell
curl "https://getquipu.com/additional_incomes" \
  -H "Authorization: Bearer be32259bd1d0f4d3d02bcc0771b1b507e2b666ba9e9ba3d7c5639e853f722eb4" \
  -H "Accept: application/vnd.quipu.v1+json"
```

> Example response

```shell
{
  "data": [{
    "id": "2988939",
    "type": "additional_incomes",
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
    "type": "additional_incomes",
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

`GET /additional_incomes`

### Available filters

See [Invoices and paysheets => Available filters](#book-entries-available-filters)

### Sorting

See [Invoices and paysheets => Sorting](#book-entries-sorting)

### Side loading items

If you want to retrieve the complete information about the items associated with the additional income, you can pass `?include=items` in the url

Example:

`GET /additional_incomes?include=items`

## Getting an additional income

> Example request

```shell
curl "https://getquipu.com/additional_incomes/2989809" \
  -H "Authorization: Bearer be32259bd1d0f4d3d02bcc0771b1b507e2b666ba9e9ba3d7c5639e853f722eb4" \
  -H "Accept: application/vnd.quipu.v1+json"
```

> Example response

```shell
{
  "data": {
    "id": "2989809",
    "type": "additional_incomes",
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

`GET /additional_incomes/:additional_income_id` |
`GET /additional_incomes/:additional_income_id?include=items`

## Creating an Additional Income

> Example request

```shell
curl "https://getquipu.com/additional_incomes" \
  -H "Authorization: Bearer be32259bd1d0f4d3d02bcc0771b1b507e2b666ba9e9ba3d7c5639e853f722eb4" \
  -H "Accept: application/vnd.quipu.v1+json" \
  -H "Content-Type: application/vnd.quipu.v1+json" \
  -d '{
        "data": {
          "type": "additional_incomes",
          "attributes": {
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
                  "vat_percent": 21
                }
              }, {
                "type": "book_entry_items",
                "attributes": {
                  "concept": "Tuercas",
                  "unitary_amount": "0.35",
                  "vat_percent": 21
                }
              }]
            }
          }
        }
      }'
```

`POST /addintional_incomes`

## Updating an Additional Income

> Example request


```shell
# This request will update the attributes of the item with id 23424141,
# create a new item with concept "Tuercas",
# and destroy other items associated to the additional income if any.

curl "https://getquipu.com/additional_incomes/2682381" \
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
                  "vat_percent": 21
                }
              }, {
                "type": "book_entry_items",
                "attributes": {
                  "concept": "Tuercas",
                  "unitary_amount": "0.35",
                  "vat_percent": 21
                }
              }]
            }
          }
        }
      }'
```

`(PUT|PATCH) /additional_incomes/:additional_income_id`

## Deleting an Additional Income

> Example request

```shell
curl "https://getquipu.com/additional_incomes/2988939" \
  -X DELETE
  -H "Authorization: Bearer be32259bd1d0f4d3d02bcc0771b1b507e2b666ba9e9ba3d7c5639e853f722eb4" \
  -H "Accept: application/vnd.quipu.v1+json"
```

`DELETE /additional_incomes/:additional_income_id`


