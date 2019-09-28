(function() {
	"use strict";

	if(typeof QuickSettings === "undefined") return;

	if(!brfv4Example.gui.downloadChooser) {

		QuickSettings.useExtStyleSheet();

		brfv4Example.gui.downloadChooser = QuickSettings.create(
			2, 270, "Useful links", brfv4Example.dom.createDiv("_settingsRight"))
			.setWidth(250)
			.addHTML("Github", "The BRFv4 example packages are available on our Github page:<br><br>" +
				"<a href='https://github.com/Tastenkunst/' target='_blank'>Github</a><br/>" +
				"<a href='https://tastenkunst.github.io/brfv4_docs/what_can_i_do_with_it.html' target='_blank'>What can I do with it?</a><br/>" +
				"<a href='https://tastenkunst.github.io/brfv4_docs/' target='_blank'>Docs / API reference</a><br/><br/>"
			)
			.addHTML("Contact", "" +
				"<a href='http://www.tastenkunst.com/#/contact' target='_blank'>Email us for commercial license</a><br/>" +
				"<a href='https://twitter.com/tastenkunst' target='_blank'>Twitter</a><br/><br/>"
			)
		}
})();