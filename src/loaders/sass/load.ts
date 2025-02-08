import arrayFmt from "../../utils/array-fmt";

const ids = ["sass", "node-sass"];
const idsFmt = arrayFmt(ids);
export default async function (impl?: string): Promise<[sass.Sass, string]> {
  // Loading provided implementation
  if (impl) {
    return import(impl)
      .then((provided: sass.Sass) => {
        if (provided) return [provided, impl] as [sass.Sass, string];
        throw undefined;
      })
      .catch(() => {
        throw new Error(`Could not load \`${impl}\` Sass implementation`);
      });
  }

  // Loading one of the supported modules
  for (const id of ids) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const sass = (await import(id)) as sass.Sass;
      if (sass) return [sass, id];
      // eslint-disable-next-line no-empty
    } catch {}
  }

  throw new Error(`You need to install ${idsFmt} package in order to process Sass files`);
}
