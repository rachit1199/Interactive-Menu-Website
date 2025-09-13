Events used (list) and where
--------------------------

Mouse events:
- mouseover / mouseout: menu cards show a short story when hovered (index.html -> card listeners)
- dblclick: double-clicking a card adds 2 units to cart
- contextmenu: custom prevention to show a toast

Keyboard events:
- keydown / keyup / keypress: global shortcuts (g focuses search, a opens cart); keypress on brand triggers toast

Form events:
- submit: checkout form submission handled with validation and modal
- input: fullname input clears custom validity; search input filters menu
- change: payment select change sets custom validity
- invalid: shows a visual cue for invalid fullname

Window events:
- load: initial render
- resize: logs window size changes
- scroll: toggles header shadow
- beforeunload: saves cart

Touch events:
- touchstart / touchend: card touch provides immediate feedback on mobile

Other:
- localStorage used to persist cart and theme
- DOM manipulation: renderMenu, renderCartPage, dynamically inject elements and attach listeners
- CSS animations/transitions: cards and theme transitions
