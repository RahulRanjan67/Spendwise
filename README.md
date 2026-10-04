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
- Included PowerShell server script for running the project locally
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
git clone https://github.com/RahulRanjan67/Spendwise.git
cd Spendwise
```

Open the project through a local development server.
No backend, database, build step or external service is required.

### Why a server is needed

The app is built with ES modules, and browsers block modules from loading over the `file://` protocol.
Opening `index.html` by double-clicking it shows a blank, non-functional page, so the folder has to be served over `http://`.

This is a browser security rule rather than a fault in the project.
A page loaded from `file://` is treated as coming from an unknown origin, and the browser refuses to fetch the module files from it.
If `index.html` is opened this way, the page detects it and displays a warning explaining the same thing.

### What changed

Earlier versions of this project relied on a separate tool such as VS Code Live Server to provide the local server.
That worked, but it meant the project could not be run until an extra editor extension was installed and configured.

The project now includes `serve.ps1`, a small server script written in PowerShell.
PowerShell is already part of Windows, so cloning the repository is now enough to run the application. No extension, no installation and no configuration are required.

The application code itself was not changed by this.
`index.html`, the CSS and all JavaScript modules are exactly as they were, and the server script simply reads those files from disk and sends them to the browser over `http://`.

What the script does:

* Serves the project folder over `http://localhost:5500`
* Sends each file with the correct content type, so the browser accepts the ES modules
* Returns `404` for a file that does not exist
* Blocks requests that try to reach files outside the project folder
* Listens on `localhost` only, so the project is not exposed to the local network

Live Server and Python still work as alternatives, and are listed below.

### Option 1: PowerShell (no installation required)

`serve.ps1` is included. PowerShell ships with Windows, so nothing needs to be installed.

Open PowerShell in the project folder and run:

```
.\serve.ps1
```

Then open:

```
http://localhost:5500
```

Stop the server with `Ctrl+C`.

To use a different port, pass it as an argument:

```
.\serve.ps1 8080
```

**If PowerShell refuses to run the script**

Some Windows installations block `.ps1` files by default, which produces an error mentioning `execution policy`.
Allow the script for the current window only, then run it again:

```
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

This affects only that window and closes when it is closed, so nothing permanent is changed on the machine.

The same applies when the script is run without entering the folder first:

```
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```

### Option 2: VS Code Live Server

With the Live Server extension installed, right-click `index.html` and choose **Open with Live Server**.

### Option 3: Python

If Python is already installed:

```
python -m http.server 5500
```

Then open `http://localhost:5500`.

All three options work because they serve the folder over `http://` in the same way.

## Future Scope

SpendWise is intentionally a client-side application, but it can be taken further in the future.
A later version could introduce a backend, database, authentication and server-side data management, turning the current browser-only application into a multi-user financial platform.
For now, the focus is understanding what can be built using the browser, JavaScript and native web APIs alone.
