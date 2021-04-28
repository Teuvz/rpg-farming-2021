class RPGFarm {

    state = 'init';

    xpCounter = 0;
    heroLevel = 1;
    coinCounter = 0;

    uiLayer = null;
    uiCoins = null;
    uiLevel = null;

    container = null;
    hero = null;
    heroPosition = {x:0,y:0};
    currentScreen = null;
    gameStarted = false;
    inventory = [];
    screens = [
        {
            name: 'home',
            spawn: {default:{x:2,y:1},village:{x:5,y:6}},
            events: [{
                type: 'teleport',
                position: {x:5,y:7},
                target: 'village'
            }],
            background: 0
        },
        {
            name: 'village',
            spawn: {default:{x:5,y:1},shop:{x:2,y:6},forest:{x:6,y:3},guild:{x:1,y:3}},
            events:[{
                type: 'teleport',
                position: {x:5,y:0},
                target: 'home'
            },
            {
                type: 'teleport',
                position: {x:2,y:7},
                target: 'shop'
            },
            {
                type: 'teleport',
                position: {x:7,y:3},
                target: 'forest'
            },
            {
                type: 'teleport',
                position: {x:0,y:3},
                target: 'guild'
            }],
            background: 1
        },
        {
            name: 'shop',
            spawn: {default:{x:2,y:1}},
            events:[{
                type: 'teleport',
                position: {x:2,y:0},
                target: 'village'
            },
            {
                type: 'item',
                position: {x:5,y:2},
                price: 50000,
                name: 'cat'
            },
            {
                type: 'item',
                position: {x:5,y:4},
                price: 500000,
                name: 'gun'
            },
            {
                type: 'item',
                position: {x:5,y:6},
                price: 5000000,
                name: 'crystal'
            }],
            background: 2
        },
        {
            name: 'forest',
            spawn: {default:{x:1,y:3}},
            events:[{
                type: 'teleport',
                position: {x:0,y:3},
                target: 'village'
            }],
            background: 3,
            ennemies: true
        },
        {
            name: 'guild',
            spawn: {default:{x:6,y:3}},
            events:[{
                type: 'teleport',
                position: {x:7,y:3},
                target: 'village'
            },
            {
                type: 'dialog',
                position: {x:2,y:3},
                text: "Welcome to the adventurer's guild!"
            }
            ],
            background: 4
        }
    ];
    constructor( container ) {
        this.container = container;
        this.state = 'init';
        this.startLoad().then(() => {
            this.loadStartMenu();
        });
    }

    createGameObject() {
        let go = document.createElement('div');
        go.classList.add('gameObject');
        this.container.appendChild( go );
        return go;
    }

    positionHero( x, y ) {
        this.heroPosition.x = x;
        this.heroPosition.y = y;
        this.positionGameObject( this.hero, x, y );
    }

    positionGameObject( go, x, y ) {
        go.style.left = (x*10)+'vh';
        go.style.top = (y*10)+'vh';
        this.checkColision();
    }

    startLoad() {
        return new Promise((resolve,reject) => {
            resolve();
        });
    }

    loadStartMenu() {
        this.state = 'menu';
        this.startGame();
    }

    startGame() {

        document.addEventListener('keydown', (e) => {
            
            if (this.state != 'game')
                return;

            switch( e.key ) {
                case 'ArrowUp':
                    if ( this.heroPosition.y > 0 )
                        this.positionHero( this.heroPosition.x, --this.heroPosition.y );
                    break;
                case 'ArrowDown':
                    if ( this.heroPosition.y < 7 )
                        this.positionHero(this.heroPosition.x, ++this.heroPosition.y);
                    break;
                case 'ArrowLeft':
                    if ( this.heroPosition.x > 0 )
                        this.positionHero(--this.heroPosition.x, this.heroPosition.y);
                    break;
                case 'ArrowRight':
                    if ( this.heroPosition.x < 7 )
                        this.positionHero(++this.heroPosition.x, this.heroPosition.y);
                    break;
            }

        });

        this.loadScreen('home').then(() => {
            this.state = 'game';
            this.loadUi();
        });
        
    }

    loadUi() {
        this.uiLayer = document.createElement('div');
        this.uiLayer.id = 'ui-container';
        this.container.appendChild( this.uiLayer );

        this.uiLevel = document.createElement('div');
        this.uiLevel.id = 'ui-level';
        this.uiLayer.appendChild( this.uiLevel );

        this.uiCoins = document.createElement('div');
        this.uiCoins.id = 'ui-coins';
        this.uiCoins.innerHTML = '0 coins';
        this.uiLayer.appendChild( this.uiCoins );

        this.container.appendChild( this.uiLayer );
    }

    loadScreen( screenName ) {
        return new Promise((resolve) => {

            let previousScreen = null;

            if ( this.currentScreen ) {

                previousScreen = this.currentScreen.name;

                this.hero.remove();
                this.hero = null;

                if ( this.currentScreen.events ) {
                    this.currentScreen.events.forEach((e) => {
                        e.element.remove();
                    });
                }
                this.currentScreen = null;

                this.container.classList.remove('screen');
                this.container.classList.remove('screen-'+previousScreen);

            }

            let foundScreen = this.screens.find( (s) => { return s.name == screenName } );
            this.currentScreen = JSON.parse(JSON.stringify(foundScreen));

            this.container.classList.add('screen');
            this.container.classList.add('screen-'+this.currentScreen.name);

            this.currentScreen.events.forEach( (e) => {
                let ev = this.createGameObject();
                ev.classList.add( e.type );
                this.positionGameObject(ev, e.position.x, e.position.y);
                e.element = ev;

                if ( e.type == 'item' && e.name )
                    ev.classList.add( 'item-'+e.name );

            });

            this.hero = this.createGameObject();
            this.hero.classList.add('hero');

            let heroPositionX = this.currentScreen.spawn.default.x;
            let heroPositionY = this.currentScreen.spawn.default.y;

            if ( this.currentScreen.spawn[previousScreen] ) {
                heroPositionX = this.currentScreen.spawn[previousScreen].x;
                heroPositionY = this.currentScreen.spawn[previousScreen].y;
            }

            this.positionHero( heroPositionX, heroPositionY );

            if ( this.currentScreen.ennemies ) {
                
                let nbEnnemies = Math.floor(Math.random()*(4-1+1)+1);

                let i = 0;
                while ( ++i <= nbEnnemies ) {
                    let ennemyElement = this.createGameObject();
                    ennemyElement.classList.add('ennemy');
                    let ennemyX = Math.floor(Math.random()*(7-3+1)+3);
                    let ennemyY = Math.floor(Math.random()*(7-3+1)+3);
                    this.positionGameObject( ennemyElement, ennemyX, ennemyY );
                    
                    let ennemy = {
                        type: 'ennemy',
                        species: 'wolf',
                        xp: Math.floor(Math.random()*(100-10+1)+100),
                        coins: Math.floor(Math.random()*(10-1+1)+10),
                        position: {x:ennemyX,y:ennemyY},
                        element: ennemyElement,
                        dead: false
                    }

                    ennemyElement.classList.add('ennemy-'+ennemy.species);

                    this.currentScreen.events.push( ennemy );
                }

            }

            resolve();
            //this.displayToast(screenName);
        });
    }

    checkColision() {
        this.currentScreen.events.forEach( (e) => {
            if ( e.position.x == this.heroPosition.x && e.position.y == this.heroPosition.y ) {

                switch ( e.type ) {
                    case 'teleport':
                        this.loadScreen( e.target );
                        break;
                    case 'ennemy':
                        if ( !e.dead )
                            this.fight( e )
                        break;
                    case 'item':
                        if ( e.price <= this.coinCounter )
                            this.buy( e );
                        else
                            this.displayToast( 'The '+e.name+' costs ' + e.price );
                        break;
                    case 'dialog':
                        this.displayToast( e.text );
                }

            }
        });
    }

    displayToast( str, duration = 1000 ) {
        let toastElement = document.createElement('div');
        toastElement.classList.add('toast');
        toastElement.innerHTML = str;
        this.uiLayer.appendChild( toastElement );
        setTimeout( () => {
            toastElement.classList.add('show');
            setTimeout( () => {
                toastElement.classList.remove('show');
                setTimeout( () => {
                    toastElement.remove();
                }, 500);
            }, duration );
        }, 0);
    }

    buy( e ) {
        this.coinCounter -= e.price;
        this.uiCoins.innerHTML = this.coinCounter + ' coins';
        this.inventory.push( e );
    }

    fight( e ) {
        
        e.dead = true;
        e.element.classList.add('dead');

        this.coinCounter += e.coins;
        this.uiCoins.innerHTML = this.coinCounter + ' coins';

        this.xpCounter += e.xp;
    }

}