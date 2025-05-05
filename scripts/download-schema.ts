import { writeFileSync } from 'fs';
import { join } from 'path';

async function downloadSchema() {
    try {
        console.log('Downloading Shopify Admin API schema...');
        const response = await fetch('https://shopify.dev/admin-graphql-direct-proxy/2025-01', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `
                    query IntrospectionQuery {
                        __schema {
                            queryType { name }
                            mutationType { name }
                            subscriptionType { name }
                            types {
                                ...FullType
                            }
                            directives {
                                name
                                description
                                locations
                                args {
                                    ...InputValue
                                }
                            }
                        }
                    }

                    fragment FullType on __Type {
                        kind
                        name
                        description
                        fields(includeDeprecated: true) {
                            name
                            description
                            args {
                                ...InputValue
                            }
                            type {
                                ...TypeRef
                            }
                            isDeprecated
                            deprecationReason
                        }
                        inputFields {
                            ...InputValue
                        }
                        interfaces {
                            ...TypeRef
                        }
                        enumValues(includeDeprecated: true) {
                            name
                            description
                            isDeprecated
                            deprecationReason
                        }
                        possibleTypes {
                            ...TypeRef
                        }
                    }

                    fragment InputValue on __InputValue {
                        name
                        description
                        type { ...TypeRef }
                        defaultValue
                    }

                    fragment TypeRef on __Type {
                        kind
                        name
                        ofType {
                            kind
                            name
                            ofType {
                                kind
                                name
                                ofType {
                                    kind
                                    name
                                    ofType {
                                        kind
                                        name
                                        ofType {
                                            kind
                                            name
                                            ofType {
                                                kind
                                                name
                                                ofType {
                                                    kind
                                                    name
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                `
            })
        });

        if (!response.ok) throw new Error(`Failed to fetch schema: ${response.statusText}`);

        const result = await response.json();
        if (result.errors) {
            throw new Error(`GraphQL Error: ${result.errors[0].message}`);
        }

        const schemaPath = join(process.cwd(), 'src', 'popup', 'lib', 'schema.ts');
        const fileContent = `import type { IntrospectionQuery } from 'graphql';

// Auto-generated from https://shopify.dev/admin-graphql-direct-proxy/2025-01
// Last updated: ${new Date().toISOString()}
export const schema: IntrospectionQuery = ${JSON.stringify(result.data, null, 2)};
`;

        writeFileSync(schemaPath, fileContent);
        console.log('Schema downloaded and saved successfully!');
    } catch (error) {
        console.error('Failed to download schema:', error);
        process.exit(1);
    }
}

downloadSchema();
