import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FooterComponent } from './components/footer/footer.component';
import { TerminalComponent } from './components/terminal/terminal.component';
import { CodeEditorComponent } from './components/code-editor/code-editor.component';
import { HeaderComponent } from './components/header/header.component';
import { TabsComponent } from './components/tabs/tabs.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    FooterComponent,
    TerminalComponent,
    CodeEditorComponent,
    HeaderComponent,
    TabsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
