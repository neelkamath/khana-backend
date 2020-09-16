# Explanation

## Problem Statement

Breaks are hectic at APU, the food buses, etc. Students need to wait for long periods of time, and cooks struggle to take orders in real time while preventing students from taking the food without giving the token. We’ll make a site so students can order beforehand. There will be two sites, one for cooks, and one for students.

## Site for Students

This site will show the food points available (APU, Snacks Food Bus, Meals Food Bus). Once a food point gets selected, the available items will be displayed. The student will be able to order several items (e.g., one order could be a juice and two bun samosas) before purchasing. Upon purchasing, they’ll receive a token (e.g., `8udj1f77bcf86cd799439i23`) which they can show the cook to pick up their order. This token will be displayed as a QR code, and when the cook scans it, the order will be marked as _picked up_. The site will show whether the order has been completed yet.

## Site for Cooks

This site will be for APU, and the food buses. The cooks will log in every day to list the items for sale. Each item will consist of:

|Item Detail|Item Detail Example|Mandatory to Enter|
|:---:|:---:|:---:|
|Item name|Mexican sandwich|Yes|
|Pic|![Mexican sandwich](sandwich.jpg)|No|
|Quantity|50|No|
|Price|Rs. 25|Yes|

This site will also show the token numbers of students who have ordered along with what they’ve ordered. The student will have to pay when they come to the counter. Once an order has been prepared, the cook can indicate such so that the student knows they can come to pick it up.