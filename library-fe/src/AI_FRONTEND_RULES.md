# AI Frontend Development Rules

This file defines the rules for generating frontend code in this project.

Any AI assistant (Claude, Copilot, ChatGPT) must follow these rules when generating UI code.

---

# Tech Stack

Frontend framework:
- React

UI Library:
- Ant Design (antd)

HTTP Client:
- Axios

---

# Ant Design Usage Rules

All UI components must be built using **Ant Design components**.

Reference:
https://ant.design/components/overview/

Rules:

1. Always use components defined in the official Ant Design documentation.

2. Do NOT invent custom UI components if Ant Design already provides one.

3. Follow the usage patterns and examples shown in Ant Design documentation.

4. Preferred components:

Layout
- Layout
- Row
- Col
- Flex
- Space

Display
- Card
- List
- Typography
- Image
- Tag

Data
- Table
- Descriptions
- Statistic

Forms
- Form
- Input
- Input.Password
- Select
- Checkbox
- Radio
- DatePicker

Feedback
- Drawer
- Modal
- Spin
- Skeleton
- Alert

Navigation
- Menu
- Breadcrumb
- Pagination

---

# Styling Rules

CSS usage must be **minimal**.

Preferred order of styling:

1. Use Ant Design layout components
2. Use Ant Design props
3. Use Space / Flex for spacing
4. Only write CSS if absolutely necessary

Examples:

Bad practice:

```jsx
<div style={{ display: "flex", gap: "16px" }}>