/* Add addthis layes to the website */
addthis.layers({
	'theme' : 'transparent',
	'share' : {
	  'position' : 'left',
	  'services' : 'twitter',
	  'postShareTitle' : 'Thanks for sharing!',
	  'postShareFollowMsg' : 'Follow us',
	  'postShareRecommendedMsg' : 'Recommended for you',
	  'desktop' : true,
	  'mobile' : true
	}, 
	'follow' : {
	  'services' : [
		{'service': 'twitter', 'id': 'toolspin'}
	  ],
	  'postFollowTitle' : 'Thanks for following!',
	  'postFollowRecommendedMsg' : 'Recommended for you',
	  'mobile' : true,
	  'desktop' : true
	}
});