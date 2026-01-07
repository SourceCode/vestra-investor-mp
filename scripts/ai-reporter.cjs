
const fs = require('fs');
const path = require('path');

/**
 * AI-Optimized Jest Reporter
 * 
 * Purpose:
 * 1. Provide deterministic output (clean of variable interaction noise).
 * 2. Provide FULL error details without truncation.
 * 3. Output in a structured format (XML-like tags) for easy parsing by LLMs.
 */
class AIReporter {
    constructor(globalConfig, options) {
        this._globalConfig = globalConfig;
        this._options = options;
    }

    onRunStart() {
        console.log('\n<TEST_RUN_START>');
    }

    onTestResult(test, testResult) {
        if (testResult.numFailingTests > 0) {
            console.log(`\n<TEST_FILE_FAILURE path="${test.path}">`);

            testResult.testResults.forEach(result => {
                if (result.status === 'failed') {
                    console.log(`  <FAILED_TEST name="${result.fullName.replace(/"/g, '&quot;')}">`);
                    result.failureMessages.forEach(msg => {
                        // Clean up ANSI codes if present (Jest usually sends them, we want plain text for AI or raw)
                        // But keeping ANSI might be fine if the agent terminal supports it. 
                        // Better to strip for pure parsing reliability.
                        // Using a simple regex to strip basic colors if needed, 
                        // but standard Jest string usually contains them.
                        // We will wrap CDATA style to be safe.
                        console.log(`    <FAILURE_MESSAGE><![CDATA[`);
                        console.log(msg);
                        console.log(`    ]]></FAILURE_MESSAGE>`);
                    });
                    console.log(`  </FAILED_TEST>`);
                }
            });

            console.log(`</TEST_FILE_FAILURE>`);
        }
    }

    onRunComplete(contexts, results) {
        console.log('\n<TEST_RUN_SUMMARY>');
        console.log(`  Total: ${results.numTotalTests}`);
        console.log(`  Passed: ${results.numPassedTests}`);
        console.log(`  Failed: ${results.numFailedTests}`);
        console.log(`  Pending: ${results.numPendingTests}`);
        console.log('</TEST_RUN_SUMMARY>');
    }
}

module.exports = AIReporter;
