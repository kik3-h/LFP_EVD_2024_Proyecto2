const express = require('express');
const { LexicalAnalyzer } = require('../analyzers/LexicalAnalyzer');
const { SyntacticAnalyzer } = require('../analyzers/SyntacticAnalyzer');

const router = express.Router();

router.post('/analyze', async (req, res) => {
    const { code } = req.body;

    try {
        const lexicalAnalyzer = new LexicalAnalyzer();
        const tokens = lexicalAnalyzer.analyze(code);

        const syntacticAnalyzer = new SyntacticAnalyzer();
        const parseTree = syntacticAnalyzer.parse(tokens);

        res.json({
            tokens,
            parseTree,
            errors: lexicalAnalyzer.errors,
        });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred during analysis', error: error.message });
    }
});

module.exports = router; //