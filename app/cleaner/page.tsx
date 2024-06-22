'use client';

import '../../styles.css';
import { action, runCommands } from './actions';
import { useActionState } from 'react';

export default function Page() {
  const [state, formAction] = useActionState(action, { output: '' });

  return (
    <div className="flex min-h-screen">
      <div className="w-1/2">
        <form action={formAction}>
          <textarea
            className="w-full h-[400px]"
            placeholder="Input"
            name="input"
            defaultValue={state.input}
          />
          <button className="text-2xl bg-blue-500 text-white px-10 py-4 rounded-xl border-none">
            Clean
          </button>
        </form>
      </div>
      <div className="w-1/2">
        <textarea
          className="w-full h-[400px]"
          placeholder="Output"
          value={state.output}
        />
        <h4>warnings</h4>
        <div>
          <pre>{JSON.stringify(state.warnings, null, 2)}</pre>
          <form action={runCommands}>
            <textarea
              className="h-[150px] overflow-auto w-full"
              name="commands"
              value={state.files
                ?.map(([o, f]) => `cp ${o} public${f}`)
                .join(' && ')}></textarea>
            <button className="text-2xl bg-blue-500 text-white px-10 py-4 rounded-xl border-none">
              Run commands
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
