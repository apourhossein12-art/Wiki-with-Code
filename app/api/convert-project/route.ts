/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { ConversionConfig, ProjectFile } from '@/lib/types';
import { generateDeterministicConversion } from '@/lib/converter-utils';

export async function POST(req: NextRequest) {
  try {
    const { files, config }: { files: ProjectFile[]; config: ConversionConfig } = await req.json();

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: 'No files provided for conversion' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const startTime = Date.now();

    // Fallback to deterministic AST if API key is not configured or placeholder
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      const result = generateDeterministicConversion(files, config);
      result.latencyMs = Date.now() - startTime;
      return NextResponse.json(result);
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const filesSummary = files
      .map(
        (f) => `### File: ${f.path}\n\`\`\`${f.language || 'text'}\n${f.content}\n\`\`\``
      )
      .join('\n\n');

    const prompt = `You are Code Converter Pro v4.0, an elite principal engineer specializing in multi-file framework migrations.
Convert this entire multi-file project from "${config.sourceStack}" to "${config.targetStack}".
Architectural structure: ${config.architecture} (isMonorepo: ${config.architecture === 'monorepo'})
TypeScript: ${config.useTypeScript ? 'Enabled' : 'Disabled'}
State strategy: ${config.stateStrategy}

Strict conversion instructions:
1. Preserve relationships between files (imports, shared types, hooks/stores). Provide both English and Persian (Fa) explanations.
2. Structure folders according to target framework best practices.
3. Output strict JSON matching the schema.

Here are the source files:
${filesSummary}`;

    try {
      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              projectAnalysis: {
                type: Type.OBJECT,
                properties: {
                  sourceSummary: { type: Type.STRING },
                  sourceSummaryFa: { type: Type.STRING },
                  relationships: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        from: { type: Type.STRING },
                        to: { type: Type.STRING },
                        type: { type: Type.STRING },
                        description: { type: Type.STRING },
                        descriptionFa: { type: Type.STRING },
                      },
                      required: ['from', 'to', 'type'],
                    },
                  },
                  sharedModules: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  keyDecisions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  keyDecisionsFa: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['sourceSummary', 'relationships', 'sharedModules', 'keyDecisions'],
              },
              recommendedTargetStructure: {
                type: Type.OBJECT,
                properties: {
                  isMonorepo: { type: Type.BOOLEAN },
                  treeDescription: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  explanationFa: { type: Type.STRING },
                  fileMapping: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        source: { type: Type.STRING },
                        target: { type: Type.STRING },
                        reason: { type: Type.STRING },
                        reasonFa: { type: Type.STRING },
                      },
                      required: ['source', 'target', 'reason'],
                    },
                  },
                },
                required: ['isMonorepo', 'treeDescription', 'fileMapping'],
              },
              convertedFiles: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    path: { type: Type.STRING },
                    originalPath: { type: Type.STRING },
                    content: { type: Type.STRING },
                    language: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    explanationFa: { type: Type.STRING },
                    status: { type: Type.STRING },
                  },
                  required: ['path', 'content', 'language', 'explanation'],
                },
              },
              dependencyUpdates: {
                type: Type.OBJECT,
                properties: {
                  notes: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  notesFa: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['notes'],
              },
              migrationNotes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              migrationNotesFa: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'projectAnalysis',
              'recommendedTargetStructure',
              'convertedFiles',
              'dependencyUpdates',
              'migrationNotes',
            ],
          },
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI conversion response timed out')), 9000)
      );

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      const responseText = response.text || '';
      const parsed = JSON.parse(responseText);

      parsed.engine = 'gemini-3.8-flash';
      parsed.latencyMs = Date.now() - startTime;
      parsed.targetStack = config.targetStack;
      parsed.convertedAt = new Date().toISOString();

      return NextResponse.json(parsed);
    } catch {
      const fallbackResult = generateDeterministicConversion(files, config);
      fallbackResult.latencyMs = Date.now() - startTime;
      return NextResponse.json(fallbackResult);
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error during project conversion' },
      { status: 500 }
    );
  }
}
