import { Injectable } from '@angular/core';
import {
    CanActivate,
    Router,
    ActivatedRouteSnapshot,
    UrlTree
} from '@angular/router';
import { AuthService } from './services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
        return this.authService.getUser().pipe(
            map(() => {
                console.log('Utilisateur connecté');

                const expectedRole = route.data['role'];
                const userRole = this.authService.getUserRole();

                if (expectedRole && expectedRole !== userRole) {
                    return this.router.parseUrl('/unauthorized');
                }

                return true;
            }),
            catchError(() => {
                return of(this.router.parseUrl('/login'));
            })
        );
    }

}
