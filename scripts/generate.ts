import chalk from 'chalk';
import readline from 'readline';
import { generateApp } from './generators/app';
import { generateEntity } from './generators/entity';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
};

const main = async () => {
    console.log(chalk.bold.cyan('\n🚀 WebOS Code Generator\n'));
    console.log('Select a generator:');
    console.log('1. Entity (Schema, Entity, Repo, Service, Router)');
    console.log('2. App (New Application Structure)');
    console.log('3. Exit');

    const choice = await question(chalk.green('\nChoose [1-3]: '));

    switch (choice.trim()) {
        case '1': {
            console.log(chalk.cyan('\n--- Generate Entity ---'));
            const name = await question('Entity Name (PascalCase, e.g. ProjectTask): ');
            if (!name) {
                console.log(chalk.red('Name is required.'));
                break;
            }

            const domain = await question('Domain (kebab-case, e.g. crm): ');
            if (!domain) {
                console.log(chalk.red('Domain is required.'));
                break;
            }

            const tableName = await question('Table Name (optional snake_case, enter to skip): ');

            await generateEntity({ name, domain, tableName: tableName || undefined });
            break;
        }
        case '2': {
            console.log(chalk.cyan('\n--- Generate App ---'));
            const name = await question('App Name (PascalCase, e.g. ProjectManager): ');
            if (!name) {
                console.log(chalk.red('Name is required.'));
                break;
            }

            await generateApp({ name });
            break;
        }
        case '3':
            console.log('Exiting...');
            break;
        default:
            console.log(chalk.red('Invalid choice.'));
    }

    rl.close();
};

main().catch((err) => {
    console.error(err);
    rl.close();
});
