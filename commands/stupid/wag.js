module.exports = (OpalBot) => {
    const out = {}; 
    
    out.peasants = {};
    out.peasants.wag = (message, content, lang) => {
        var imgs = [
            'https://cdn.weeb.sh/images/S1ircyFwb.gif',
            'https://cdn.weeb.sh/images/Byef8cJtwb.gif',
            'https://cdn.weeb.sh/images/HJ_r5JYwW.gif',
            'https://cdn.weeb.sh/images/S14BqJYvW.gif',
            'https://cdn.weeb.sh/images/SkgjHcyYDZ.gif',
            'https://cdn.weeb.sh/images/HklUqyFP-.gif',
            'https://cdn.weeb.sh/images/H1hVqkFP-.gif',
            'https://cdn.weeb.sh/images/ByCBqytPb.gif',
            'https://cdn.weeb.sh/images/rkkSqyFv-.gif',
            'https://cdn.weeb.sh/images/S1g1Hq1tvb.jpeg',
            'https://cdn.weeb.sh/images/rJCVcytDW.gif',
            'https://cdn.weeb.sh/images/ByJ85ktDb.gif',
            'https://cdn.weeb.sh/images/SJMU9Jtwb.gif',
            'https://cdn.weeb.sh/images/HkgnV9JYD-.jpeg',
            'https://cdn.weeb.sh/images/rynHqkKD-.gif',
            'https://cdn.weeb.sh/images/ByQUc1YP-.jpeg',
            'https://cdn.weeb.sh/images/rJtHqkYw-.gif'
        ];
        channel.message.send(imgs[Math.floor(Math.random() * imgs.length)]);
    };

    return out;
};
