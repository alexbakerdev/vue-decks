import { merge, assign } from "lodash";

const DATA_KEYS = [
  "class",
  "staticClass",
  "style",
  "attrs",
  "props",
  "domProps",
  "on",
  "nativeOn",
  "directives",
  "scopesSlots",
  "slot",
  "ref",
  "key"
];

function mutateKey(keyName) {
  const newKey = `${keyName}-clone`;
  return newKey;
}

function extractData(vnode, isComp) {
  const data = _.pick(vnode.data, DATA_KEYS);
  if (isComp) {
    const cOpts = vnode.componentOptions;
    assign(data, {
      props: cOpts.propsData,
      on: cOpts.listeners
    });
  }

  if (data.key) {
    data.key = mutateKey(data.key);
  }

  return data;
}

export function cloneVNode(h, vnode, extraData) {
  const isComp = !!vnode.componentOptions;
  const isText = !vnode.tag; // this will also match comments but those will be dropped, essentially
  const children = isComp ? vnode.componentOptions.children : vnode.children;

  if (isText) return vnode.text;
  let data = extractData(vnode, isComp);

  if (data.directives) {
    data.directives = data.directives.filter(d => d.name !== "page-transition");
  }

  data = merge(data, extraData);

  const tag = isComp ? vnode.componentOptions.Ctor : vnode.tag;

  const childNodes = children ? children.map(c => cloneVNode(h, c)) : undefined;
  return h(tag, data, childNodes);
}
