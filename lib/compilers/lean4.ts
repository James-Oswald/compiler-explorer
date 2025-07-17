import * as fs from 'node:fs';
import {OptRemark} from '../../static/panes/opt-view.interfaces.js';
import {ActiveTool, CacheKey} from '../../types/compilation/compilation.interfaces.js';
import {ParseFiltersAndOutputOptions} from '../../types/features/filters.interfaces.js';
import {SelectedLibraryVersion} from '../../types/libraries/libraries.interfaces.js';
import {logger} from '../logger.js';
import * as StackUsage from '../stack-usage-transformer.js';
import {ClangCompiler} from './clang.js';

// leanc is a thin wrapper around clang
export class Lean4Compiler extends ClangCompiler {
    static override get key() {
        return 'lean4';
    }

    //We wrap super.doCompilation (which calls leanc, a clang wrapper) with a call to the lean compiler
    //which compiles Lean 4 code into C code.
    override async doCompilation(
        inputFilename: string,
        dirPath: string,
        key: CacheKey,
        options: string[],
        filters: ParseFiltersAndOutputOptions,
        backendOptions: Record<string, any>,
        libraries: SelectedLibraryVersion[],
        tools: ActiveTool[],
    ): Promise<[any, OptRemark[], StackUsage.StackUsageInfo[]]> {
        // Use extraPath which holds leanc to compile Lean 4 code into a C file
        const lean_compiler = this.getInfo().extraPath[0];
        logger.debug(`Using Lean compiler: ${lean_compiler}`);
        const intermediateFile = inputFilename.replace(/\.lean$/, '.c');
        const result = await this.exec(lean_compiler, ['-c', intermediateFile, inputFilename], {});
        if (result.code !== 0 || !fs.existsSync(intermediateFile)) {
            logger.error(`Lean 4 compilation to C failed: ${result.stdout}`);

            return [null, [], []];
        }
        logger.debug(`Lean 4 compilation to C succeeded: ${intermediateFile}`);
        const new_result: Promise<[any, OptRemark[], StackUsage.StackUsageInfo[]]> = super.doCompilation(
            intermediateFile,
            dirPath,
            key,
            options,
            filters,
            backendOptions,
            libraries,
            tools,
        );
        return new_result;
    }

    // override optionsForFilter(
    //     filters: ParseFiltersAndOutputOptions,
    //     outputFilename: string,
    //     userOptions?: string[],
    // ): string[] {
    //     logger.info(`Filtering options for output file: ${outputFilename}`);
    //     return super.optionsForFilter(filters, outputFilename, userOptions).concat(['-c ']);
    // }
}
