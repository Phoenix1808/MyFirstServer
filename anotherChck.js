// import 'package:flutter/material.dart';

// void main() {
//   runApp(const MyApp());
// }

// class MyApp extends StatelessWidget {
//   const MyApp({super.key});

//   // This widget is the root of your application.
//   @override
//   Widget build(BuildContext context) {
//     return MaterialApp(
//       title: 'Flutter Demo',
//       theme: ThemeData(
//         // This is the theme of your application.
//         //
//         // TRY THIS: Try running your application with "flutter run". You'll see
//         // the application has a purple toolbar. Then, without quitting the app,
//         // try changing the seedColor in the colorScheme below to Colors.green
//         // and then invoke "hot reload" (save your changes or press the "hot
//         // reload" button in a Flutter-supported IDE, or press "r" if you used
//         // the command line to start the app).
//         //
//         // Notice that the counter didn't reset back to zero; the application
//         // state is not lost during the reload. To reset the state, use hot
//         // restart instead.
//         //
//         // This works for code too, not just values: Most code changes can be
//         // tested with just a hot reload.
//         colorScheme: .fromSeed(seedColor: Colors.deepPurple),
//       ),
//       home: const MyHomePage(title: 'Flutter Demo Home Page'),
//     );
//   }
// }

// class MyHomePage extends StatefulWidget {
//   const MyHomePage({super.key, required this.title});

//   // This widget is the home page of your application. It is stateful, meaning
//   // that it has a State object (defined below) that contains fields that affect
//   // how it looks.

//   // This class is the configuration for the state. It holds the values (in this
//   // case the title) provided by the parent (in this case the App widget) and
//   // used by the build method of the State. Fields in a Widget subclass are
//   // always marked "final".

//   final String title;

//   @override
//   State<MyHomePage> createState() => _MyHomePageState();
// }

// class _MyHomePageState extends State<MyHomePage> {
//   int _counter = 0;

//   void _incrementCounter() {
//     setState(() {
//       // This call to setState tells the Flutter framework that something has
//       // changed in this State, which causes it to rerun the build method below
//       // so that the display can reflect the updated values. If we changed
//       // _counter without calling setState(), then the build method would not be
//       // called again, and so nothing would appear to happen.
//       _counter++;
//     });
//   }

//   @override
//   Widget build(BuildContext context) {
//     // This method is rerun every time setState is called, for instance as done
//     // by the _incrementCounter method above.
//     //
//     // The Flutter framework has been optimized to make rerunning build methods
//     // fast, so that you can just rebuild anything that needs updating rather
//     // than having to individually change instances of widgets.
//     return Scaffold(
//       appBar: AppBar(
//         // TRY THIS: Try changing the color here to a specific color (to
//         // Colors.amber, perhaps?) and trigger a hot reload to see the AppBar
//         // change color while the other colors stay the same.
//         backgroundColor: Theme.of(context).colorScheme.inversePrimary,
//         // Here we take the value from the MyHomePage object that was created by
//         // the App.build method, and use it to set our appbar title.
//         title: Text(widget.title),
//       ),
//       body: Center(
//         // Center is a layout widget. It takes a single child and positions it
//         // in the middle of the parent.
//         child: Column(
//           // Column is also a layout widget. It takes a list of children and
//           // arranges them vertically. By default, it sizes itself to fit its
//           // children horizontally, and tries to be as tall as its parent.
//           //
//           // Column has various properties to control how it sizes itself and
//           // how it positions its children. Here we use mainAxisAlignment to
//           // center the children vertically; the main axis here is the vertical
//           // axis because Columns are vertical (the cross axis would be
//           // horizontal).
//           //
//           // TRY THIS: Invoke "debug painting" (choose the "Toggle Debug Paint"
//           // action in the IDE, or press "p" in the console), to see the
//           // wireframe for each widget.
//           mainAxisAlignment: .center,
//           children: [
//             const Text('You have pushed the button this many times:'),
//             Text(
//               '$_counter',
//               style: Theme.of(context).textTheme.headlineMedium,
//             ),
//           ],
//         ),
//       ),
//       floatingActionButton: FloatingActionButton(
//         onPressed: _incrementCounter,
//         tooltip: 'Increment',
//         child: const Icon(Icons.add),
//       ),
//     );
//   }
// }

import 'package:flutter/material.dart';
import 'dart:math';

void main() {
  runApp(const DevQuoteApp());
}

class DevQuoteApp extends StatelessWidget {
  const DevQuoteApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'DevQuote',
      theme: ThemeData.dark(),
      home: const HomeScreen(),
    );
  }
}

//statelessWidget is a widget that does not require mutable state. It means that the widget's properties cannot change over time. It is used when the UI does not need to update dynamically based on user interactions or data changes. StatelessWidget is typically used for static content, such as displaying text, images, or icons that do not change during the app's lifecycle.

//hence statefulWidget is a widget that can hold mutable state. It means that the widget's properties can change over time, and the UI can update dynamically based on user interactions or data changes. StatefulWidget is used when the UI needs to reflect changes in the underlying data or when user interactions require updates to the UI. It consists of two classes: the StatefulWidget itself, which is immutable, and the State class, which holds the mutable state and contains the build method to create the UI based on that state.

// class HomeScreen extends StatelessWidget {
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  
  int currentIndex = 0;
 
    // final String quoteText = "Code is like Humor. When you have to explain it, it's bad";
    // final String quoteAuthor = " Divyansh Goyal";

    final List<Map<String, String>> quotes = [
      {
        "text": "Code is like Humor. When you have to explain it, it's bad",
        "author": "Divyansh Goyal",
      },
      {
        "text": "First, solve the problem. Then, write the code.",
        "author": "John Johnson",
      },
      {
        "text": "Experience is the name everyone gives to their mistakes.",
        "author": "Oscar Wilde",
      },
    ];
    // final random = Random(); //generates random numbers
    

    void nextQuote() {
    final random = Random();
    setState(() { //“Data changed → rebuild UI”
      currentIndex = random.nextInt(quotes.length);
    });
  }
 
 @override
   Widget build(BuildContext context) {
    final quote = quotes[currentIndex];
    return Scaffold(
      appBar: AppBar(title: const Text("DevQuote"), centerTitle: true),
      body:Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children:[
            Container(
              margin: const EdgeInsets.all(20),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.grey[900],
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children:[
                  Text(
                    quote["text"]!,
                    style: const TextStyle(
                      fontSize: 18,
                      fontStyle: FontStyle.italic,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),
                  Text(
                    "- ${quote["author"]!}",
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.right,
                  ),      
                ],
              ),
            ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: nextQuote,
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 23, vertical:12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
              backgroundColor: Colors.deepPurple,
            ),
            child: const Text(
              "Next Quote",
               style: TextStyle(fontSize: 16, fontWeight:FontWeight.w500),
          ),
          ),
          ],
        ),
      ),
    );
  }
}

//container is kinda box which can have size,color,padding,design
//margin is space outside box and padding is space inside box
