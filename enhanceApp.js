import { cloneVNode } from "./cloneVNode";

export default ({ Vue }) => {
  Vue.mixin({
    computed: {
      $step() {
        return this.$route.query.step;
      }
    }
  });

  Vue.component("ListTransitions", {
    name: "ListTransitions",
    functional: true,
    render(h, context) {
      if (context.children) {
        const listItems = context.children || [];
        const children = listItems.reduce((children, vnode, i) => {
          const newData = {};
          newData.style = { display: "block" };
          newData.attrs = newData.attrs || {};
          newData.key = `list-transition-${i}`;
          newData.class = newData.class || {};
          newData.class["list-item"] = true;
          const newNode = cloneVNode(h, vnode, newData);
          children.push(newNode);
          return children;
        }, []);

        return [
          h(
            "TransitionGroup",
            {
              props: { name: "list", tag: "div" },
              class: { "transition-list": true }
            },
            children
          )
        ];
      }
    }
  });

  Vue.component("MagicTransition", {
    name: "MagicTransition",
    functional: true,
    render(h, context) {
      if (context.children) {
        if (context.children.length === 1) {
          const rootChild = context;
          const listItems = rootChild.children || [];
          return [
            h(
              "TransitionGroup",
              {
                props: {
                  name: "list",
                  tag: "div"
                },
                class: {
                  "transition-list": true
                }
              },
              listItems.reduce((children, li, i) => {
                debugger;
                if (li.tag) {
                  li.data = li.data || {};
                  li.data.style = { display: "block" };
                  li.data.attrs = li.data.attrs || {};
                  li.data.key = `list-transition-${i}`;
                  li.data.class = li.data.class || {};
                  li.data.class["list-item"] = true;
                  li = h(li.tag, li.data, li.children);
                }

                children.push(li);
                return children;
              }, [])
            )
          ];
        }
      }
    }
  });
};
