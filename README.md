[Catalog](https://nebelwerfer41.github.io/) · [Repository](https://github.com/nebelwerfer41/flashBack)

# Flash Back

Manage crew and department call times, with text import and export.

## Usage

Add a name, role, and department, or import lines in the format Role, Name, Department, Time. Set call times for all crew or for a department. Edit a time cell and lock times that should remain unchanged. Export the data and copy it before closing the page.

## Local setup

Serve the folder with a static server and open the local address in a browser:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

No build step is required. HTML, CSS, and JavaScript. The page includes no external library.

## Limitations

Data is held in memory within the page. Import splits each line on commas and does not implement a complete CSV parser: avoid commas in values. Export before reloading or closing the page.

## License

[MIT](LICENSE). Copies and derivative works must retain the copyright notice and license text. Dependencies and third-party materials retain their own licenses.
