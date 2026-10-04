# SpendWise

SpendWise is a browser-based personal finance application built with HTML, CSS and vanilla JavaScript. It allows users to record, manage and analyse income and expenses directly in the browser while keeping the data persistent through `localStorage`.

The project was built as a practical exercise in using JavaScript to create a complete client-side application without relying on a frontend framework.

## Features

- Add, edit and delete income and expense transactions
- Categorise transactions
- Search transactions by description or notes
- Filter by type, category and month
- Sort transactions by date or amount
- View balance, income, expenses and transaction counts
- Switch between two demo accounts (Personal and Family) to explore different sample data
- Analyse spending by category and month
- Create and manage monthly category budgets
- Track budget usage with dynamic progress indicators
- Import and export application data as JSON
- Export transactions as CSV
- Restore sample data or clear stored data
- Persistent storage using `localStorage`
- Dynamic toast notifications and confirmation dialogs
- Fictional advertisement area with rotating content and dismissal
- Responsive layout for desktop, tablet and mobile

## Why SpendWise?

SpendWise was designed as a deliberate step between two different kinds of projects in this learning path.

The previous project, **TechFest 360**, focused mainly on revisiting HTML and CSS fundamentals through a complete static webpage. SpendWise moves the focus toward JavaScript and asks a different question:
How much of a useful application can I build directly in the browser using JavaScript?

The project after this one, **BookTrail**, focuses on consuming data from external REST APIs. That introduces asynchronous JavaScript, `fetch()`, HTTP requests, JSON responses, loading states, API errors and communication with an external system.
Those concepts could technically have been added to SpendWise. However, they represent a different problem from the one SpendWise is intended to solve.

SpendWise is primarily about:
User interaction → JavaScript state → Calculations → DOM updates → Browser storage

BookTrail is primarily about:
User interaction → JavaScript → HTTP request → External API → JSON response → UI update

Keeping the two projects separate makes the progression more meaningful. SpendWise concentrates on client-side application logic and browser capabilities, while BookTrail can focus specifically on API consumption and asynchronous workflows.

SpendWise also gave me an opportunity to experiment with a different visual style from TechFest 360.
Instead of placing the application directly against a plain page background, the project uses a large background image with the main interface presented inside a floating central content shell.
On wider screens, the application does not cover the entire viewport. The background remains visible on both sides of the content, creating a layered appearance.

## Commercial Perspective

A small fictional advertisement area was included as an experiment in thinking beyond pure functionality.
It is not connected to a real advertising platform. Instead, JavaScript controls a set of fictional advertisements, including rotation and dismissal behaviour.
The purpose is to explore how an application could reserve space for sponsored content while keeping that functionality separate from the core product.
This also introduces a small commercial perspective into an otherwise educational project: the interface is not only designed around features, but also around how additional content or business opportunities could fit into the product without disrupting its main purpose.

## Data Management

The application stores its state locally in the browser using localStorage.
The stored state contains the underlying application data, while calculated values are generated when needed.
SpendWise also supports moving data outside the browser through:

* JSON export
* JSON import
* CSV export

This makes the project a practical exercise in client-side data persistence, serialization and browser file handling rather than just a demonstration of localStorage.

## Running the Project

Clone the repository:

```
git clone https://github.com/RahulRanjan67/SpendWise.git
cd SpendWise
```

Open the project through a local development server, such as VS Code Live Server.
No backend, database or external service is required.

The app is built with ES modules, and browsers block modules from loading over the `file://` protocol. Opening `index.html` by double-clicking it will show a blank, non-functional page, so it needs to be served over `http://` through a local server.

## Future Scope

SpendWise is intentionally a client-side application, but it can be taken further in the future.
A later version could introduce a backend, database, authentication and server-side data management, turning the current browser-only application into a multi-user financial platform.
For now, the focus is understanding what can be built using the browser, JavaScript and native web APIs alone.
