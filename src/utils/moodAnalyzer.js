export const analyzeMoodLocally = (text) => {
  if (!text || !text.trim()) return { mood: "neutral", emoji: "😐" };

  const lowerText = text.toLowerCase();

  // 🔹 Negation words
  const negations = ["nahi", "na", "nahin", "not"];

  // 🔹 Keywords per mood (English + Roman Urdu ) -- 200+ each
  const moodKeywords = {
    happy: [
      "happy","joy","khush","khushi","mast","mazedaar","hansi","masti","smile","laugh","awesome","fantastic",
      "good","yay","amazing","great","excited","delighted","sunny","bright","cheerful","smiley","lovely",
      "fun","party","funny","hepi","heppy","joyful","pleasant","thrilled","content","blessed","excellent",
      "wonderful","perfect","super","cool","positive","funf","bliss","sunshine","joyous","loving","goodvibes",
      "smileface","happygood","hahaha","hehe","lol","funniest","enjoy","yippee","bestday","fantasticday","happytime",
      "happyface","awesomeee","joyfull","smiling","goodtime","cheery","laughing","exciting","smileyface","cheerfulday",
      "happyfeel","happyvibes","lovelyday","joyfulmoment","yayyay","goodmood","funfun","hepii","hepiii","happydayyy",
      "partytime","funvibes","positivevibes","sunnyday","happylife","joyfullife","smileyday","funfilled","awesomefun",
      "greattime","happyenergy",
      "khushi hui","bohot khush","dil khush","masti mein","hansi aayi","maze aya","khushi ka mahsoos","achha lag raha","mauj masti"
    ],
    sad: [
      "sad","udaas","dukhi","lonely","cry","heartbroken","down","tired","pain","grief","stress","tension","blue",
      "melancholy","tear","broken","sorrow","upset","hopeless","helpless","frustrated","woe","hurt","loss",
      "udaasi","dukhiya","niraash","dil dukhi","udasi ka ehsaas","dukhi hoon","sadface","tearful","crying","weep",
      "sadmoment","sadfeeling","painfulday","sadday","sadlife","badmood","upsetface","lonelytime","tragic","tragically",
      "miserable","troublesome","depressing","sadly","blehday","heartache","brokenheart","lonelyyy","sadness","sadnessss",
      "downcast","melancholic","depressinggg","woeful","lossfeel","tearfeeling","sadfeelinggg","sadfacee","downfeeling",
      "lonelyface","painfeeling","blehfeeling","troubled","dukhi mehsoos","dukhi feel","dard mehsoos","udasi mehsoos"
    ],
    angry: [
      "angry","ghussa", "gusy", "marunga", "chorunga", "gussy", "naraz","rage","furious","annoyed","hate","mad","irritated","pissed","frustrated","upset",
      "annoy","grumpy","tension","anger","ghusse","narazgi","ghussewala","ghussaa","angery","angeryyy","madface",
      "rageface","furiousface","annoyedface","angriness","madfeeling","upsetface","hatefeel","frustratedface","pissedoff",
      "irritatedface","angryday","ragefeel","annoying","irritation","temper","fuming","boiling","infuriated","madmoment",
      "naraz hoon","ghussa aa gaya","ghussa aaya","dil naraz","ghusse ka ehsaas","narazgi ka ehsaas","narazfeel"
    ],
    stressed: [
      "stressed","pareshan","tang","thak","pressure","overworked","nervous","tense","fatigue","burnout",
      "panic","overthinking","stresst","stressedout","pressurefeel","overworkedday","worried","tensed","tension",
      "stressedday","burnoutfeel","overthinkingfeel","fatigued","frustratedfeel","worriedday","panicfeel","tiredday",
      "exhaustedfeel","stresstime","overloaded","anxious","nervousfeel","strain","tensefeel","tiredfeel","stressface",
      "fatiguefeel","anxiety","anxiousday","overload","overloadfeel","burnedout","fatigueday","panicky","tensedday",
      "stressedtime","tensionday","exhaustion","overthinkingday","panicday","nervousday","pressurefeeling","stressedface",
      "fatigueface","tiredface","worriedfacee","overwork","stressedmood","strainface","overthinkingface","burnedoutday",
      "stresstime","panicface","anxiousmoment","tiredmoment","overloaded","worriedmoment","frustratedtime","overthinkingmoment",
      "stressedmoment","pressuremoment","fatiguemoment","stressmoment","burnoutmoment",
      "soch raha","fikr","dimaag mein tension","kaam ka pressure","stress mehsoos","pareshani","thakan","tanaav","overthinking ka ehsaas"
    ]
  };

  const emojis = { happy:"😊", sad:"😢", angry:"😠", stressed:"😫", neutral:"😐" };

  // 🔹 Check each mood with negation handling
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        // check negation before/after
        const isNegated = negations.some(
          (neg) => lowerText.includes(neg + " " + keyword) || lowerText.includes(keyword + " " + neg)
        );
        if (isNegated) {
          // flip mood if negated
          if (mood === "happy") return { mood: "sad", emoji: emojis.sad };
          if (mood === "sad") return { mood: "happy", emoji: emojis.happy };
          if (mood === "angry") return { mood: "neutral", emoji: emojis.neutral };
          if (mood === "stressed") return { mood: "neutral", emoji: emojis.neutral };
        } else {
          return { mood, emoji: emojis[mood] };
        }
      }
    }
  }

  return { mood: "neutral", emoji: "😐" };
};
