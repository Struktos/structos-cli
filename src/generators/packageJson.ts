import { ProjectOptions } from '../types';
import { getDependencies } from '../utils/project';

/**
 * Generate package.json content
 */
export function generatePackageJson(options: ProjectOptions): string {
  const { dependencies, devDependencies } = getDependencies(options);

  const packageJson = {
    name: options.name,
    version: '1.0.0',
    description: `${options.name} - Built with Struktos.js`,
    main: 'dist/app.js',
    scripts: {
      dev: 'tsx watch src/app.ts',
      build: 'tsc',
      start: 'node dist/app.js',
      'start:dev': 'nodemon --exec tsx src/app.ts',
      test: 'echo "Error: no test specified" && exit 1'
    },
    keywords: ['struktos', options.framework, 'hexagonal-architecture'],
    author: '',
    license: 'MIT',
    dependencies: dependencies.reduce((acc, dep) => {
      const [name, version] = dep.split('@^');
      acc[name] = version ? `^${version}` : 'latest';
      return acc;
    }, {} as Record<string, string>),
    devDependencies: devDependencies.reduce((acc, dep) => {
      const [name, version] = dep.split('@^');
      acc[name] = version ? `^${version}` : 'latest';
      return acc;
    }, {} as Record<string, string>)
  };

  return JSON.stringify(packageJson, null, 2);
}