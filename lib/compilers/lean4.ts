import { CacheKey, CompilationCacheKey, CompilationResult, ExecutionOptionsWithEnv } from '../../types/compilation/compilation.interfaces.js';
import { PreliminaryCompilerInfo } from '../../types/compiler.interfaces.js';
import { ParseFiltersAndOutputOptions } from '../../types/features/filters.interfaces.js';
import {BaseCompiler} from '../base-compiler.js';
import * as path from 'node:path';
import { CompilationEnvironment } from '../compilation-env.js';
import { AsmParserCpp } from '../parsers/asm-parser-cpp.js';

export class Lean4Compiler extends BaseCompiler {
    static get key() {
        return 'lean4';
    }

    constructor(info: PreliminaryCompilerInfo, env: CompilationEnvironment) {
        super(info, env);

        //this.asm = new AsmParserCpp();
        this.outputFilebase = 'example';
    }

    override getCompilerResultLanguageId(filters?: ParseFiltersAndOutputOptions): string | undefined {
        return 'cppp';
    }

    public override getOutputFilename(dirPath: string, outputFilebase: string, key?: CacheKey | CompilationCacheKey): string {
        let filename: string;

        if (this.isCacheKey(key) && key.backendOptions.customOutputFilename) {
            filename = key.backendOptions.customOutputFilename;
        } else {
            filename = `${outputFilebase}.cpp`;
        }

        if (dirPath) {
            return path.join(dirPath, filename);
        }
        return filename;
    }

    protected override optionsForFilter(filters: ParseFiltersAndOutputOptions, outputFilename: string, userOptions?: string[]): string[] {
        return ["--c=" + outputFilename]
    }

    protected

    // override async runCompiler(
    //     compiler: string,
    //     options: string[],
    //     inputFilename: string,
    //     execOptions: ExecutionOptionsWithEnv,
    //     filters?: ParseFiltersAndOutputOptions,
    // ): Promise<CompilationResult> {
    //     // Step 1: Run the Lean4 compiler to generate C++ code
    //     const leanOutputFilename = this.getOutputFilename(execOptions.customCwd || '', 'lean_output.cpp');
    //     const leanOptions = [...options, '-c', leanOutputFilename];
    //     const leanResult = await this.exec(compiler, leanOptions, execOptions);

    //     if (leanResult.code !== 0) {
    //         return {
    //             ...this.transformToCompilationResult(leanResult, inputFilename),
    //             asm: [{ text: 'Lean4 compilation failed' }],
    //         };
    //     }

    //     // Step 2: Run the secondary compiler (e.g., GCC or Clang) on the generated C++ code
    //     const cppCompiler = 'clang'; // Replace with the desired C++ compiler
    //     const cppOutputFilename = this.getOutputFilename(execOptions.customCwd || '', 'output');
    //     const cppOptions = ['-std=c++17', leanOutputFilename, '-o', cppOutputFilename];
    //     const cppResult = await this.exec(cppCompiler, cppOptions, execOptions);

    //     if (cppResult.code !== 0) {
    //         return {
    //             ...this.transformToCompilationResult(cppResult, inputFilename),
    //             asm: [{ text: 'C++ compilation failed' }],
    //         };
    //     }

    //     // Combine results and return
    //     return {
    //         ...this.transformToCompilationResult(cppResult, inputFilename),
    //         asm: [{ text: 'Compilation succeeded' }],
    //     };
    // }
}