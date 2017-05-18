## Welcome to PVC, a Program Version Checker

_PVC_ is a command line driven asynchronous Project Version Checker. It enables checking of the latest versions of various software projects that may be held at different repositories e.g. github, sourceforge, pypi, etc. In addition to support for a range of such common public repositories, support for additional repos may be added by the user via a plugin system.

_**What is asynchronous about it?**_ For any list of software projects being tracked, instead working through the list and connecting one at a time to each of the relevant repositories, _PVC_ opens connections to all the repos at the same time. If each network query to a repo takes, say, 3 seconds to return a result then a sequential iteration through a list of, say, 20 projects would take about 60 seconds to complete. On the other hand the asynchronous approach entails connecting to all 20 repos at the same time and all results are returned in about 3 seconds. In case that sounds too good to be true, let's say 5 seconds.

_**What's so good about the plugin system?**_ Different repository types (github, sourceforge, etc.) are represented in _PVC_ by module files, one for each supported repo. The format of these module files is fairly constant with relatively minor differences between them. It should be quite easy to adapt one of them to [create new module files](#writing-new-module-files) to support additional repository types. If _PVC_ is installed as a system application (rather than having just pulled it down into your own user directory space)

### Markdown

Markdown is a lightweight and easy-to-use syntax for styling your writing. It includes conventions for

```markdown
Syntax highlighted code block

# Header 1
## Header 2
### Header 3

- Bulleted
- List

1. Numbered
2. List

**Bold** and _Italic_ and `Code` text

[Link](url) and ![Image](src)
```








For more details see [GitHub Flavored Markdown](https://guides.github.com/features/mastering-markdown/).

### Jekyll Themes

Your Pages site will use the layout and styles from the Jekyll theme you have selected in your [repository settings](https://github.com/cwilling/pvc/settings). The name of this theme is saved in the Jekyll `_config.yml` configuration file.

### Support or Contact

Having trouble with Pages? Check out our [documentation](https://help.github.com/categories/github-pages-basics/) or [contact support](https://github.com/contact) and we’ll help you sort it out.





## Writing new module files

chjaskhcac cjkxljc

