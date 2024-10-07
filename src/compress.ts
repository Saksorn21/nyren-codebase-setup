import { createArchive } from './lib/zipUtil.js'
import { tools } from './lib/help.js'
(async () => {
  try {
    tools.log(tools.info,tools.textDeepBlue('Compressing template typescript'))
    await createArchive('./repo-templates/ts', './repo-templates/ts.zip');
    tools.log(tools.info,tools.textDeepBlue('Compressing template javascript'))
    await createArchive('./repo-templates/js', './repo-templates/js.zip');
    tools.log(tools.success,'Archive created successfully!');
  } catch (err) {
    tools.log(tools.error,'Error creating archive:', err);
  }
})();