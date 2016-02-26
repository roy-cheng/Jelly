module.exports = {
    "extends": 'eslint:recommended',
    "parserOptions": {
        "ecmaVersion": 6,
        "ecmaFeatures": {
            "jsx": true,
            "Promisze": true
        }
    },
    "rules": {
        "semi": 2,
        "linebreak-style": "off",
        "no-console": ["error", {
            allow: ["warn", "error"]
        }],
        "no-unused-vars": ["error", {
            "args": "none"
        }]
    },
    "env": {
        "browser": true,
        "node": true,
        "es6": true
    }
}