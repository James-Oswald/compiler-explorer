import {log} from 'node:console';
import path from 'node:path';
import {OptRemark} from '../../static/panes/opt-view.interfaces.js';
import {ActiveTool, CacheKey} from '../../types/compilation/compilation.interfaces.js';
import {PreliminaryCompilerInfo} from '../../types/compiler.interfaces.js';
import {ParseFiltersAndOutputOptions} from '../../types/features/filters.interfaces.js';
import {SelectedLibraryVersion} from '../../types/libraries/libraries.interfaces.js';
import {BaseCompiler} from '../base-compiler.js';
import {CompilationEnvironment} from '../compilation-env.js';
import * as StackUsage from '../stack-usage-transformer.js';

export class Lean4Compiler extends BaseCompiler {
    static get key() {
        return 'lean4';
    }

    constructor(info: PreliminaryCompilerInfo, env: CompilationEnvironment) {
        super(info, env);
        this.outputFilebase = 'example';
    }

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
        log(`Using Lean compiler: ${lean_compiler}`);
        const intermediateFile = path.join(dirPath, inputFilename.replace(/\.lean$/, '.c'));
        const result = await this.exec(lean_compiler, ['-c', intermediateFile, inputFilename], {});
        if (result.code !== 0) {
            return [result, [], []];
        }
        log(`Lean 4 compilation to C succeeded: ${intermediateFile}`);
        return super.doCompilation(intermediateFile, dirPath, key, options, filters, backendOptions, libraries, tools);
    }

    override optionsForFilter(
        filters: ParseFiltersAndOutputOptions,
        outputFilename: string,
        userOptions?: string[],
    ): string[] {
        return ['-g -c -o ' + outputFilename];
    }
}
