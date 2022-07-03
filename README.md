# Discord.js Bot Template in TypeScript
This is a simple template to make creating and running bots with TypeScript easier, including helpers and other such things. Simple base a repository with this template and get started creating a bot!

> Note: much of this repository is based off of my endeavors with [AwesomeSciBo](https://github.com/ADawesomeguy/AwesomeSciBo).

## Building and Running  
### Method 1 (Node):  
After cloning the repository, dependencies can be installed with `yarn` or `npm i`. The bot can then be compile to JavaScript with `yarn tsc` or `npx tsc`, and will be deployed in the `built/` directory. Finally, the bot can be run by entering said directory and running `./index.js` or `node index.js`. 

### Method 2 (Docker):  
This bot has a Dockerfile within the repository which can be built using `docker build . -t [tag]`.

## Credit
This template was created by ADawesomeguy. Please don't hesitate to contribute!
