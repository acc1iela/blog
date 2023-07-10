import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'
import {markdownSchema} from 'sanity-plugin-markdown'
import {CustomMarkdownInput} from './CustomMarkdownInput'

export default defineConfig({
  name: 'default',
  title: 'acc1iela blog',

  projectId: 'a1d0ki1x',
  dataset: 'production',

  plugins: [deskTool(), visionTool(), markdownSchema({input: CustomMarkdownInput})],

  schema: {
    types: schemaTypes,
  },
})
