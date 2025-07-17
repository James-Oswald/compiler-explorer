import * as monaco from 'monaco-editor';

const keywords = [
    'attribute',
    'global',
    'local',
    'scoped',
    'partial',
    'unsafe',
    'private',
    'protected',
    'noncomputable',
    'sorry',
    'admit',
    'stop',
    'print',
    'eval',
    'reduce',
    'check',
    'deriving',
    'instance',
    'inductive',
    'coinductive',
    'structure',
    'theorem',
    'axiom',
    'abbrev',
    'lemma',
    'def',
    'class',
    'constant',
    'show',
    'have',
    'from',
    'suffices',
    'nomatch',
    'match',
    'with',
    'for',
    'in',
    'unless',
    'try',
    'catch',
    'finally',
    'return',
    'continue',
    'break',
    'true',
    'false',
];

const typeKeywords = [
    'Prop',
    'Type',
    'Sort',
    'Type*',
    'Int',
    'Nat',
    'String',
    'Char',
    'Bool',
    'Unit',
    'List',
    'Array',
    'Option',
    'Sum',
    'Prod',
    'IO',
    'Except',
    'Monad',
    'Int32',
    'Int64',
    'UInt32',
    'UInt64',
    'Float32',
    'Float64',
];

const operators = ['=>', '->', '<-', ':=', ':', '=', '∀', '→', 'λ', '∃', '\\', '|', ';'];

const symbols = /[=><!~?:&|\+\-\*\/\^%λ→∀∃]+/;

const escapes = /\\(?:[ntr"\\'xu][0-9A-Fa-f]*)/;

function definition(): monaco.languages.IMonarchLanguage {
    return {
        defaultToken: '',
        tokenPostfix: '.lean4',

        keywords: keywords,
        typeKeywords: typeKeywords,
        operators: operators,

        // characters and symbols
        symbols: symbols,
        escapes: escapes,

        // The main tokenizer for our languages
        tokenizer: {
            root: [
                // identifiers and keywords
                [
                    /[a-zA-Z_][\w_]*/,
                    {
                        cases: {
                            '@typeKeywords': 'keyword',
                            '@keywords': 'keyword',
                            '@default': 'identifier',
                        },
                    },
                ],

                // whitespace and comments
                {include: '@whitespace'},

                // delimiters and operators
                [/[{}()[\]]/, '@brackets'],
                //[/[<>](?!@symbols)/, '@brackets'],
                [/@symbols/, 'operator'],

                // numbers
                [/\b0x[0-9A-Fa-f_]*[0-9A-Fa-f]\b/, 'number.hex'],
                [/\b\d+(\.\d+)?([eE][+\-]?\d+)?\b/, 'number'],

                // strings
                [/"$/, 'string', '@popall'],
                [/"(.*)$/, 'string.invalid'],
                [/"/, 'string', '@string'],

                // characters
                [/'[^\\']'/, 'string'],
                [/'/, 'string', '@char'],
            ],

            // Deal with whitespace, line comments and nested block comments
            whitespace: [
                [/[ \t\r\n]+/, 'white'],
                [/--.*$/, 'comment'], // line comment
                [/\/-!/, 'comment.doc', '@comment'], // module doc comment
                [/\/--/, 'comment.doc', '@comment'], // doc comment
                [/\/-/, 'comment', '@comment'], // nested block comment start
            ],

            comment: [
                [/[^\-\/]+/, 'comment'],
                [/-\//, 'comment', '@pop'], // end of block comment
                [/\/-/, 'comment', '@push'], // nested block comment
                [/[-\/]/, 'comment'],
            ],

            // Recognize string literals, including escapes
            string: [
                [/[^\\"]+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/"/, 'string', '@pop'],
            ],

            char: [
                [/[^\\']+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/'/, 'string', '@pop'],
            ],
        },
    };
}

function configuration(): monaco.languages.LanguageConfiguration {
    return {
        comments: {
            lineComment: '--',
            blockComment: ['/-', '-/'],
        },
        brackets: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')'],
        ],
        autoClosingPairs: [
            {open: '[', close: ']'},
            {open: '{', close: '}'},
            {open: '(', close: ')'},
            {open: '"', close: '"', notIn: ['string']},
            {open: "'", close: "'", notIn: ['string', 'comment']},
        ],
        surroundingPairs: [
            {open: '{', close: '}'},
            {open: '[', close: ']'},
            {open: '(', close: ')'},
            {open: '"', close: '"'},
            {open: "'", close: "'"},
        ],
    };
}

monaco.languages.register({id: 'lean4'});
monaco.languages.setMonarchTokensProvider('lean4', definition());
monaco.languages.setLanguageConfiguration('lean4', configuration());
