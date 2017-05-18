## Welcome to PVC, a Program Version Checker

_PVC_ is a command line driven asynchronous Project Version Checker. It enables checking of the latest versions of various software projects that may be held at different repositories e.g. github, sourceforge, pypi, etc. In addition to built in support for a range of such common public repositories, support for additional repos may be added by the user via a plugin system.

_**What is asynchronous about it?**_ For any list of software projects being tracked, instead of working through the list and connecting one at a time to each of the relevant repositories, _PVC_ opens connections to all the repos at the same time. If each network query to a repo takes, say, 3 seconds to return a result then a sequential iteration through a list of, say, 20 projects would take about 60 seconds to complete. On the other hand the asynchronous approach entails connecting to all 20 repos at the same time and all results are returned in about 3 seconds. In case that sounds too good to be true, let's say 5 seconds.

A caveat on this huge improvement is the case where a project hosted at GitHub has had many, many releases. These releases are returned in 'pages' of 30 releases per page. There's no hold up for projects with fewer than 30 releases but for more than 30 releases, additional connections (one for each page) are required. This means that a project that has had, say, 250 releases will need 9 connections. The catch is that these connections should be sequential resulting in a delay of approximately 27 seconds until all the results have been retrieved. Fortunately projects with so many releases are not common.

_**What's so good about the plugin system?**_ Different repository types (github, sourceforge, etc.) are represented in _PVC_ by module files, one for each supported repo. The format of these module files is fairly constant with relatively minor differences between them. It should be quite easy to adapt any of them to [create new module files](#writing-new-module-files) to support additional repository types. However if _PVC_ is installed as a system application (rather than having just pulled it down into your own user directory space), the 'ordinary' user wouldn't normally be able to install it in the system directory holding the existing module files. To deal with this problem, _PVC_ recognises a particular directory within the user's part of the file system into which any new module files can be installed. At runtime, _PVC_ loads these additional module files, thereby adding support for new repository types.

Of course any new module files for repository types that might be widely used are welcome to be contributed for inclusion as one of _PVC_'s built in modules. A pull request would be a good mechanism for this sort of contribution.

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

