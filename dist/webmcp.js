const toolName = (prefix, ...parts) => [prefix, ...parts].join('_').replace(/[^A-Za-z0-9_]/g, '_');
/**
 * Generate the WebMCP tool set from the agent surface — pure; derives
 * everything from describe() and closes over the agent for execution.
 */
export const webmcpTools = (agent, options = {}) => {
    const { prefix = 'tosi', allowWrites = false } = options;
    const description = agent.describe();
    const tools = [
        {
            name: toolName(prefix, 'describe'),
            description: "The app's live affordance map: state roots, wired elements (flat " +
                'records — tag/label/text, bound props as "value ⟷ path" where ⟷ ' +
                'means two-way/user-writable and ⟵ means display-only), named ' +
                'actions, and per-element geometry (bounds). Start here.',
            inputSchema: {
                type: 'object',
                properties: { styles: { type: 'boolean' } },
            },
            execute: (input) => agent.describe({ styles: input?.styles === true }),
        },
        {
            name: toolName(prefix, 'read'),
            description: 'Read the serializable value at a state path (paths come from ' +
                `${toolName(prefix, 'describe')}).`,
            inputSchema: {
                type: 'object',
                properties: { path: { type: 'string' } },
                required: ['path'],
            },
            execute: (input) => agent.read(String(input?.path)),
        },
        {
            name: toolName(prefix, 'changes'),
            description: 'Everything that changed since your last turn, coalesced to ' +
                'final-value-per-path. Pass the cursor from your previous call; ' +
                'the response includes the next cursor.',
            inputSchema: {
                type: 'object',
                properties: { since: { type: 'number' } },
            },
            execute: (input) => agent.changes(Number(input?.since ?? 0)),
        },
    ];
    for (const actionPath of description.actions) {
        tools.push({
            name: toolName(prefix, 'act', actionPath),
            description: `Invoke the app action \`${actionPath}\` — the same function the ` +
                'UI is wired to. Arguments are passed through positionally.',
            inputSchema: {
                type: 'object',
                properties: { args: { type: 'array' } },
            },
            execute: (input) => agent.call(actionPath, ...(input?.args ?? [])),
        });
    }
    if (allowWrites || description.exposure === 'introspection') {
        tools.push({
            name: toolName(prefix, 'write'),
            description: 'Write a value to a state path — it flows through the same ' +
                'observers as user input, so every bound widget updates. DEV MODE: ' +
                'writes are unvalidated until state-level contracts land.',
            inputSchema: {
                type: 'object',
                properties: { path: { type: 'string' }, value: {} },
                required: ['path'],
            },
            execute: (input) => {
                agent.write(String(input?.path), input?.value);
                return { written: input?.path };
            },
        });
    }
    return tools;
};
/**
 * Detect the WebMCP host, register the generated tools, return
 * { tools, unregister } — or undefined when no host API is present.
 */
export const webmcpAdapter = (agent, options = {}) => {
    const mc = options.modelContext ??
        globalThis.document?.modelContext ??
        globalThis.navigator?.modelContext;
    if (mc == null)
        return undefined;
    const tools = webmcpTools(agent, options);
    const undo = [];
    if (typeof mc.registerTool === 'function') {
        for (const tool of tools) {
            const handle = mc.registerTool(tool);
            if (handle != null && typeof handle.unregister === 'function') {
                undo.push(() => handle.unregister());
            }
            else if (typeof mc.unregisterTool === 'function') {
                undo.push(() => mc.unregisterTool(tool.name));
            }
        }
    }
    else if (typeof mc.provideContext === 'function') {
        // NOTE: provideContext replaces the page's whole tool context — if the
        // app also registers its own tools this way, coordinate registration in
        // one place (or use a registerTool-shaped host)
        mc.provideContext({ tools });
        undo.push(() => mc.provideContext({ tools: [] }));
    }
    else {
        return undefined;
    }
    return {
        tools: tools.map((tool) => tool.name),
        unregister: () => {
            for (const fn of undo)
                fn();
        },
    };
};
