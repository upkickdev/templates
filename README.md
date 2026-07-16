# upkick

A minimal CLI tool for scaffolding new project boilerplates in seconds. When you run `upkick create <project-name>`, it picks up the folder name as the project name and generates a boilerplate project based on that folder's contents.

## 🚀 Features

- **Zero configuration** — No setup required after installation.
- **Folder-name-driven scaffolding** — `upkick create` automatically uses the current folder name as the project name.
- **Instant boilerplate** — Generate all baseline project files with a single command.
- **Template-based** — Powered by templates stored in the `templates/` directory.

## 📦 Installation

```bash
npm install -g upkick/cli
```

Or use it without installing globally:

```bash
npx upkick create <project-name>
```

## 🛠 Usage

`upkick create` reads the current folder name and uses it as the project name, scaffolding a new project inside that directory.

### 1. Scaffold from the current folder

```bash
mkdir my-app
cd my-app
upkick create
```

This uses the current folder name (`my-app`) as the project name and writes all boilerplate files into it.

### 2. Specify the project name explicitly

```bash
upkick create my-app
```

Creates a new project with the given name.

### 3. Help

```bash
upkick --help
upkick create --help
```

## 📂 Project Structure

Running `upkick` produces a structure similar to the following:

```
my-app/
├── src/
│   └── index.<ext>
├── README.md
├── .gitignore
├── package.json
└── ...
```

The exact files and folders depend on the chosen template.

## 🧩 Templates

This directory (`templates/`) holds the boilerplate templates used by `upkick`. To add a new template:

1. Create a new folder under `templates/` (e.g. `react-app`, `node-api`).
2. Drop your template files into that folder.
3. Reference the template when running `upkick create`:

```bash
upkick create my-app --template react-app
```

## 💡 Examples

### Scaffold a React project

```bash
mkdir todo-app && cd todo-app
upkick create
```

### Scaffold a Node.js API project

```bash
mkdir user-service && cd user-service
upkick create
```

## 🤝 Contributing

1. Fork this repository.
2. Create a new branch (`git checkout -b feature/new-template`).
3. Commit your changes (`git commit -m 'feat: add new template'`).
4. Push to the branch (`git push origin feature/new-template`).
5. Open a Pull Request.

## 📄 License

MIT