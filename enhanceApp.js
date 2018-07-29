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
        if (context.children.length === 1) {
          const rootChild = context.children[0];
          const listItems = rootChild.children;
          return [
            h(
              "TransitionGroup",
              {
                props: {
                  name: "list",
                  tag: rootChild.tag
                }
              },
              listItems.reduce((children, li, i) => {
                if (li.tag) {
                  li.data = li.data || {};
                  li.data.attrs = li.data.attrs || {};
                  li.data.key = `list-transition-${i}`;
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
