# Copy and download shopify menus

The main idea here is to use the shopify docs MCP server to create a working chrome extension that takes a menu from a shop and copies it. Adding -copy at the end of the handle, other than that it should be exactly identical

It should also be able to export and import menus with JSON

We should be able to find the menu on the page automatically, Not by searching.

it shoud only work on domains that are admin.shopify.com. Here's an exmaple of a valid menu domain that should be able to download or copy: https://admin.shopify.com/store/dailyride-1866/content/menus/288387662207

the id of course should be replaced as well as the store handle (dailyride-1866)

Importing from JSON however should be available always work on any admin.shopify.com site. After import is completed we should redirect to that menu site