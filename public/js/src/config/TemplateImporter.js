define(
	[
		'text!/templates/root.hbs',
		'text!/templates/mainMenu.hbs'
	],
	function(
		root,
		mainMenu
	)
	{
		return {
			root: root,
			mainMenu: mainMenu	
		};
	}
);